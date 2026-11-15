export type SpeechStatus = "idle" | "listening" | "error" | "unsupported";

export class TranscriptionService {
  private recognition: any = null;
  private isListening = false;
  private interimTranscript = "";
  private finalTranscript = "";
  private onTranscriptUpdateCallback: ((finalText: string, interimText: string) => void) | null = null;
  private onStatusChangeCallback: ((status: SpeechStatus, error?: string) => void) | null = null;
  private restartAllowed = true;
  private currentLanguage = "en-GB";

  isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  initialize(lang = "en-GB"): boolean {
    if (!this.isSupported()) return false;
    this.currentLanguage = lang;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    try {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = lang;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onStatusChangeCallback) this.onStatusChangeCallback("listening");
      };

      this.recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            this.finalTranscript += (this.finalTranscript ? " " : "") + res[0].transcript.trim();
          } else {
            interim += res[0].transcript;
          }
        }
        this.interimTranscript = interim;
        if (this.onTranscriptUpdateCallback) {
          this.onTranscriptUpdateCallback(this.finalTranscript, this.interimTranscript);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          this.restartAllowed = false;
          this.isListening = false;
          if (this.onStatusChangeCallback) {
            this.onStatusChangeCallback("error", "Microphone access denied or speech recognition service blocked.");
          }
        }
      };

      this.recognition.onend = () => {
        // Auto-restart if still flagged as listening (handles normal speech pauses)
        if (this.isListening && this.restartAllowed) {
          try {
            this.recognition.start();
          } catch {
            this.isListening = false;
            if (this.onStatusChangeCallback) this.onStatusChangeCallback("idle");
          }
        } else {
          this.isListening = false;
          if (this.onStatusChangeCallback) this.onStatusChangeCallback("idle");
        }
      };

      return true;
    } catch (e) {
      console.error("SpeechRecognition initialization failed:", e);
      return false;
    }
  }

  startListening(
    onUpdate: (finalText: string, interimText: string) => void,
    onStatusChange?: (status: SpeechStatus, error?: string) => void
  ): boolean {
    this.onTranscriptUpdateCallback = onUpdate;
    this.onStatusChangeCallback = onStatusChange || null;
    this.interimTranscript = "";
    this.finalTranscript = "";
    this.restartAllowed = true;

    if (!this.recognition) {
      const ok = this.initialize(this.currentLanguage);
      if (!ok) {
        if (onStatusChange) onStatusChange("unsupported");
        return false;
      }
    }

    try {
      this.isListening = true;
      this.recognition.start();
      return true;
    } catch {
      // Might already be active
      return true;
    }
  }

  stopListening(): string {
    this.restartAllowed = false;
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    const combined = (this.finalTranscript + (this.interimTranscript ? " " + this.interimTranscript : "")).trim();
    return combined;
  }

  resetTranscript(): void {
    this.finalTranscript = "";
    this.interimTranscript = "";
    if (this.onTranscriptUpdateCallback) {
      this.onTranscriptUpdateCallback("", "");
    }
  }

  setManualTranscript(text: string): void {
    this.finalTranscript = text;
    this.interimTranscript = "";
    if (this.onTranscriptUpdateCallback) {
      this.onTranscriptUpdateCallback(this.finalTranscript, "");
    }
  }

  // Text-To-Speech (TTS) for interviewer voice
  static speakText(
    text: string,
    options?: { voiceName?: string; rate?: number; onStart?: () => void; onEnd?: () => void }
  ): void {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel(); // Stop any pending utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate || 1.0;
    utterance.pitch = 1.0;
    utterance.lang = "en-GB";

    const voices = window.speechSynthesis.getVoices();
    if (options?.voiceName) {
      const selectedVoice = voices.find(v => v.name === options.voiceName);
      if (selectedVoice) utterance.voice = selectedVoice;
    } else {
      // Prefer British or natural English voice
      const preferred = voices.find(v => v.lang.includes("en-GB") || v.name.includes("UK") || v.name.includes("Natural"));
      if (preferred) utterance.voice = preferred;
    }

    if (options?.onStart) utterance.onstart = options.onStart;
    if (options?.onEnd) utterance.onend = options.onEnd;

    window.speechSynthesis.speak(utterance);
  }

  static stopSpeaking(): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const transcriptionService = new TranscriptionService();

