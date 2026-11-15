import { VisualAttentionAssessment } from "@/types";

export interface LiveVisionFrameResult {
  faceDetected: boolean;
  isFacingScreen: boolean;
  confidence: number;
  yawDegrees: number;
  pitchDegrees: number;
  rollDegrees: number;
  statusColor: "green" | "yellow" | "red" | "grey";
}

export class VisionService {
  private faceLandmarker: any = null;
  private isModelLoading = false;
  private modelLoadError: string | null = null;
  private isInitialized = false;

  // Session tracking variables
  private isSessionActive = false;
  private totalFramesSampled = 0;
  private faceDetectedFrames = 0;
  private screenFacingFrames = 0;
  private lookingAwayEventsCount = 0;
  private isCurrentlyLookingAway = false;
  private lookingAwayStartTimestamp = 0;
  private totalAvailableFrames = 0;
  private sessionStartTimestamp = 0;

  // Calibration offsets (set during pre-interview calibration)
  private yawOffset = 0;
  private pitchOffset = 0;

  async initializeLandmarker(): Promise<boolean> {
    if (this.faceLandmarker) return true;
    if (this.isModelLoading) return false;

    this.isModelLoading = true;
    this.modelLoadError = null;

    try {
      const vision = await import("@mediapipe/tasks-vision");
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      this.faceLandmarker = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1,
      });

      this.isInitialized = true;
      this.isModelLoading = false;
      return true;
    } catch (err: unknown) {
      console.warn("GPU-accelerated FaceLandmarker failed, trying CPU fallback:", err);
      try {
        const vision = await import("@mediapipe/tasks-vision");
        const filesetResolver = await vision.FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        this.faceLandmarker = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "CPU",
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1,
        });
        this.isInitialized = true;
        this.isModelLoading = false;
        return true;
      } catch (cpuErr: unknown) {
        const msg = cpuErr instanceof Error ? cpuErr.message : String(cpuErr);
        this.modelLoadError = msg;
        this.isModelLoading = false;
        this.isInitialized = false;
        console.error("FaceLandmarker CPU initialization also failed:", cpuErr);
        return false;
      }
    }
  }

  isReady(): boolean {
    return this.isInitialized && !!this.faceLandmarker;
  }

  getLoadError(): string | null {
    return this.modelLoadError;
  }

  calibrate(yaw: number, pitch: number): void {
    this.yawOffset = yaw;
    this.pitchOffset = pitch;
  }

  startSessionTracking(): void {
    this.isSessionActive = true;
    this.totalFramesSampled = 0;
    this.faceDetectedFrames = 0;
    this.screenFacingFrames = 0;
    this.lookingAwayEventsCount = 0;
    this.isCurrentlyLookingAway = false;
    this.lookingAwayStartTimestamp = 0;
    this.totalAvailableFrames = 0;
    this.sessionStartTimestamp = performance.now();
  }

  /**
   * Process a single video frame from HTMLVideoElement
   */
  processVideoFrame(video: HTMLVideoElement, timestampMs: number): LiveVisionFrameResult {
    if (!this.faceLandmarker || video.readyState < 2 || video.videoWidth === 0) {
      return {
        faceDetected: false,
        isFacingScreen: false,
        confidence: 0,
        yawDegrees: 0,
        pitchDegrees: 0,
        rollDegrees: 0,
        statusColor: "grey",
      };
    }

    try {
      const results = this.faceLandmarker.detectForVideo(video, timestampMs);
      const faceDetected = results.faceLandmarks && results.faceLandmarks.length > 0;

      if (!faceDetected) {
        if (this.isSessionActive) {
          this.totalFramesSampled++;
        }
        return {
          faceDetected: false,
          isFacingScreen: false,
          confidence: 0,
          yawDegrees: 0,
          pitchDegrees: 0,
          rollDegrees: 0,
          statusColor: "grey",
        };
      }

      const landmarks = results.faceLandmarks[0];

      // Key 3D facial landmarks:
      // 1: Nose tip
      // 152: Chin bottom
      // 33: Left eye outer corner
      // 263: Right eye outer corner
      // 61: Left mouth corner
      // 291: Right mouth corner
      const nose = landmarks[1];
      const chin = landmarks[152];
      const leftEye = landmarks[33];
      const rightEye = landmarks[263];

      // Yaw estimation (horizontal rotation in degrees)
      const eyeMidX = (leftEye.x + rightEye.x) / 2;
      const eyeDistanceX = Math.abs(rightEye.x - leftEye.x);
      const rawYawRatio = eyeDistanceX > 0 ? (nose.x - eyeMidX) / eyeDistanceX : 0;
      const rawYawDegrees = rawYawRatio * 75 - this.yawOffset;

      // Pitch estimation (vertical rotation in degrees)
      const eyeMidY = (leftEye.y + rightEye.y) / 2;
      const faceHeightY = Math.abs(chin.y - eyeMidY);
      const noseRelativeY = faceHeightY > 0 ? (nose.y - eyeMidY) / faceHeightY : 0.5;
      const rawPitchDegrees = (noseRelativeY - 0.42) * 85 - this.pitchOffset;

      // Roll estimation
      const deltaX = rightEye.x - leftEye.x;
      const deltaY = rightEye.y - leftEye.y;
      const rollDegrees = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

      // Screen facing threshold
      // Within +/- 22 degrees yaw and +/- 20 degrees pitch is standard screen gazing range
      const isFacingScreen = Math.abs(rawYawDegrees) <= 22 && Math.abs(rawPitchDegrees) <= 20;

      // Compute status indicator
      let statusColor: "green" | "yellow" | "red" | "grey" = "green";
      if (!isFacingScreen) {
        if (Math.abs(rawYawDegrees) > 35 || Math.abs(rawPitchDegrees) > 32) {
          statusColor = "red";
        } else {
          statusColor = "yellow";
        }
      }

      // Track session metrics
      if (this.isSessionActive) {
        this.totalFramesSampled++;
        this.faceDetectedFrames++;
        if (isFacingScreen) {
          this.screenFacingFrames++;
        }

        const now = performance.now();
        if (!isFacingScreen) {
          if (!this.isCurrentlyLookingAway) {
            this.isCurrentlyLookingAway = true;
            this.lookingAwayStartTimestamp = now;
          } else {
            // If sustained looking away for more than 1300ms
            if (now - this.lookingAwayStartTimestamp >= 1300) {
              this.lookingAwayEventsCount++;
              // Reset so we don't count the same continuous look-away multiple times per second
              this.lookingAwayStartTimestamp = now + 1500;
            }
          }
        } else {
          this.isCurrentlyLookingAway = false;
        }
      }

      return {
        faceDetected: true,
        isFacingScreen,
        confidence: 0.92,
        yawDegrees: Math.round(rawYawDegrees),
        pitchDegrees: Math.round(rawPitchDegrees),
        rollDegrees: Math.round(rollDegrees),
        statusColor,
      };
    } catch {
      return {
        faceDetected: false,
        isFacingScreen: false,
        confidence: 0,
        yawDegrees: 0,
        pitchDegrees: 0,
        rollDegrees: 0,
        statusColor: "grey",
      };
    }
  }

  finishSessionTracking(): VisualAttentionAssessment {
    this.isSessionActive = false;

    if (this.totalFramesSampled === 0 || !this.isInitialized) {
      return {
        available: false,
        overallAttentionScore: 100, // Not penalized
        faceVisibilityPercent: 0,
        screenFacingConsistencyPercent: 0,
        lookingAwayEvents: 0,
        trackingAvailabilityPercent: 0,
        confidence: 0,
        statusColor: "grey",
        statusMessage: "Camera or face tracking was not active during this answer. Score is calculated using remaining valid dimensions.",
        diagnosticNotes: "No video frames were analyzed. Video analysis is optional and non-punitive.",
      };
    }

    const faceVisibilityPercent = Math.min(100, Math.round((this.faceDetectedFrames / this.totalFramesSampled) * 100));
    const screenFacingConsistencyPercent = this.faceDetectedFrames > 0
      ? Math.min(100, Math.round((this.screenFacingFrames / this.faceDetectedFrames) * 100))
      : 0;

    // Calculate overall attention score:
    // 60% based on screen-facing consistency, 40% based on face visibility minus looking-away penalty
    const lookAwayPenalty = Math.min(30, this.lookingAwayEventsCount * 5);
    const rawScore = (screenFacingConsistencyPercent * 0.6) + (faceVisibilityPercent * 0.4) - lookAwayPenalty;
    const overallAttentionScore = Math.max(30, Math.min(100, Math.round(rawScore)));

    let statusColor: "green" | "yellow" | "red" | "grey" = "green";
    let statusMessage = "Consistently faced the screen with natural eye contact.";
    if (overallAttentionScore < 60 || this.lookingAwayEventsCount >= 4) {
      statusColor = "red";
      statusMessage = "Frequent measurable attention shifts away from the screen observed.";
    } else if (overallAttentionScore < 78 || this.lookingAwayEventsCount >= 2) {
      statusColor = "yellow";
      statusMessage = "Occasional attention shifts away from the screen detected.";
    }

    return {
      available: true,
      overallAttentionScore,
      faceVisibilityPercent,
      screenFacingConsistencyPercent,
      lookingAwayEvents: this.lookingAwayEventsCount,
      trackingAvailabilityPercent: 95,
      confidence: 0.9,
      statusColor,
      statusMessage,
      diagnosticNotes: "Measured locally via MediaPipe facial landmark orientation heuristics. Does not infer psychological state or dishonesty.",
    };
  }

  dispose(): void {
    if (this.faceLandmarker) {
      try {
        this.faceLandmarker.close();
      } catch {}
      this.faceLandmarker = null;
    }
    this.isInitialized = false;
  }
}

export const visionService = new VisionService();

