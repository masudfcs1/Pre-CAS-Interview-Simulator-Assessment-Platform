export interface AudioFeaturesSnapshot {
  volumePercent: number; // 0-100
  isSpeaking: boolean;
  isSilent: boolean;
  isClipping: boolean;
  speechDurationMs: number;
  pauseDurationMs: number;
  pauseCount: number;
  speechToSilenceRatio: number;
}

export class AudioService {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  // Metrics tracking during an answer
  private isTracking = false;
  private speechDurationMs = 0;
  private pauseDurationMs = 0;
  private pauseCount = 0;
  private lastSampleTime = 0;
  private inSilencePeriod = false;
  private silenceStartTimestamp = 0;

  // Constants
  private readonly SPEECH_THRESHOLD_RMS = 0.02; // Minimum RMS to consider voice activity
  private readonly PAUSE_MIN_DURATION_MS = 600; // 600ms silence counts as a pause

  async requestMicrophone(deviceId?: string): Promise<MediaStream> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      throw new Error("Microphone API (navigator.mediaDevices.getUserMedia) is not supported.");
    }

    this.stopMicrophone();

    const constraints: MediaStreamConstraints = {
      audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      video: false,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.stream = stream;

    // Initialize Web Audio API
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      this.audioContext = new AudioContextClass();
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.3;

      this.sourceNode = this.audioContext.createMediaStreamSource(stream);
      this.sourceNode.connect(this.analyser);
    }

    return stream;
  }

  startSessionTracking(): void {
    this.isTracking = true;
    this.speechDurationMs = 0;
    this.pauseDurationMs = 0;
    this.pauseCount = 0;
    this.lastSampleTime = performance.now();
    this.inSilencePeriod = false;
    this.silenceStartTimestamp = 0;
  }

  stopSessionTracking(): {
    speechDurationMs: number;
    pauseDurationMs: number;
    pauseCount: number;
    speechToSilenceRatio: number;
  } {
    this.isTracking = false;
    const total = this.speechDurationMs + this.pauseDurationMs;
    const ratio = total > 0 ? this.speechDurationMs / total : 0;
    return {
      speechDurationMs: this.speechDurationMs,
      pauseDurationMs: this.pauseDurationMs,
      pauseCount: this.pauseCount,
      speechToSilenceRatio: Number(ratio.toFixed(2)),
    };
  }

  sampleLiveFeatures(): AudioFeaturesSnapshot {
    if (!this.analyser) {
      return {
        volumePercent: 0,
        isSpeaking: false,
        isSilent: true,
        isClipping: false,
        speechDurationMs: this.speechDurationMs,
        pauseDurationMs: this.pauseDurationMs,
        pauseCount: this.pauseCount,
        speechToSilenceRatio: 0,
      };
    }

    const buffer = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(buffer);

    let sumSquares = 0;
    let peak = 0;
    for (let i = 0; i < buffer.length; i++) {
      const val = buffer[i];
      sumSquares += val * val;
      if (Math.abs(val) > peak) peak = Math.abs(val);
    }
    const rms = Math.sqrt(sumSquares / buffer.length);
    // Convert RMS to intuitive 0-100 volume scale with sensible curve
    const volumePercent = Math.min(100, Math.round(rms * 250));
    const isSpeaking = rms > this.SPEECH_THRESHOLD_RMS;
    const isSilent = !isSpeaking;
    const isClipping = peak > 0.98;

    const now = performance.now();
    if (this.isTracking && this.lastSampleTime > 0) {
      const delta = now - this.lastSampleTime;
      if (isSpeaking) {
        this.speechDurationMs += delta;
        if (this.inSilencePeriod) {
          const silenceDuration = now - this.silenceStartTimestamp;
          if (silenceDuration >= this.PAUSE_MIN_DURATION_MS) {
            this.pauseCount++;
          }
          this.inSilencePeriod = false;
        }
      } else {
        this.pauseDurationMs += delta;
        if (!this.inSilencePeriod) {
          this.inSilencePeriod = true;
          this.silenceStartTimestamp = now;
        }
      }
    }
    this.lastSampleTime = now;

    const totalTracked = this.speechDurationMs + this.pauseDurationMs;
    const speechToSilenceRatio = totalTracked > 0 ? this.speechDurationMs / totalTracked : 0;

    return {
      volumePercent,
      isSpeaking,
      isSilent,
      isClipping,
      speechDurationMs: this.speechDurationMs,
      pauseDurationMs: this.pauseDurationMs,
      pauseCount: this.pauseCount,
      speechToSilenceRatio: Number(speechToSilenceRatio.toFixed(2)),
    };
  }

  // Record an audio snippet for test playback
  async recordTestSnippet(durationMs = 4000): Promise<Blob> {
    if (!this.stream) {
      throw new Error("Microphone stream not active.");
    }
    this.recordedChunks = [];
    const mimeType = MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : MediaRecorder.isTypeSupported("audio/mp4")
      ? "audio/mp4"
      : "";

    const recorder = mimeType ? new MediaRecorder(this.stream, { mimeType }) : new MediaRecorder(this.stream);
    this.mediaRecorder = recorder;

    return new Promise((resolve, reject) => {
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(this.recordedChunks, { type: recorder.mimeType || "audio/webm" });
        resolve(audioBlob);
      };
      recorder.onerror = (err) => reject(err);

      recorder.start();
      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }, durationMs);
    });
  }

  stopMicrophone(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      try {
        this.mediaRecorder.stop();
      } catch {}
      this.mediaRecorder = null;
    }
    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {}
      this.sourceNode = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {}
      });
      this.stream = null;
    }
    this.isTracking = false;
  }
}

export const audioService = new AudioService();

