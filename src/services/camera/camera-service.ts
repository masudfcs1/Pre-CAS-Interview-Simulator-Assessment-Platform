export interface CameraStreamInfo {
  stream: MediaStream;
  width: number;
  height: number;
  frameRate: number;
  deviceId: string;
}

export class CameraService {
  private stream: MediaStream | null = null;
  private onDisconnectCallback: (() => void) | null = null;

  async requestCamera(deviceId?: string): Promise<CameraStreamInfo> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera API (navigator.mediaDevices.getUserMedia) is not supported in this browser.");
    }

    // Stop existing stream if running
    this.stopCamera();

    const constraints: MediaStreamConstraints = {
      video: deviceId
        ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
        : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
      audio: false,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.stream = stream;

    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.onended = () => {
        if (this.onDisconnectCallback) {
          this.onDisconnectCallback();
        }
      };
    }

    const settings = videoTrack?.getSettings() || {};
    return {
      stream,
      width: settings.width || 1280,
      height: settings.height || 720,
      frameRate: settings.frameRate || 30,
      deviceId: settings.deviceId || "",
    };
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  isActive(): boolean {
    return !!this.stream && this.stream.getVideoTracks().some(t => t.readyState === "live" && t.enabled);
  }

  onDisconnect(callback: () => void): void {
    this.onDisconnectCallback = callback;
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {}
      });
      this.stream = null;
    }
  }

  /**
   * Samples a video frame from a HTMLVideoElement and analyzes brightness
   */
  static analyzeLighting(video: HTMLVideoElement): { brightness: number; quality: 'good' | 'low' | 'too-bright' } {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 36;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx || video.videoWidth === 0) {
        return { brightness: 120, quality: "good" };
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      let totalLuminance = 0;
      for (let i = 0; i < data.length; i += 4) {
        // Relative luminance formula
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        totalLuminance += lum;
      }
      const avgBrightness = totalLuminance / (data.length / 4);

      if (avgBrightness < 45) return { brightness: avgBrightness, quality: "low" };
      if (avgBrightness > 225) return { brightness: avgBrightness, quality: "too-bright" };
      return { brightness: avgBrightness, quality: "good" };
    } catch {
      return { brightness: 128, quality: "good" };
    }
  }
}

export const cameraService = new CameraService();
