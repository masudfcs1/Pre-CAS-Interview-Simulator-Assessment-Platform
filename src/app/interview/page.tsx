"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Sparkles,
  Eye,
  Award,
  BookOpen,
  FileText,
  Download,
  Share2,
  Layers,
  ChevronRight,
  RefreshCw,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import {
  PreCASQuestion,
  InterviewMode,
  QuestionAttemptScorecard,
  VisualAttentionAssessment,
} from "@/types";
import { CATEGORY_LABELS } from "@/constants/default-questions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cameraService } from "@/services/camera/camera-service";
import { audioService } from "@/services/microphone/audio-service";
import { visionService, LiveVisionFrameResult } from "@/services/face-landmarker/vision-service";
import { transcriptionService, TranscriptionService } from "@/services/speech/transcription-service";
import { generateQuestionScorecard } from "@/services/assessment/scoring-engine";

export default function InterviewPage() {
  const router = useRouter();
  const {
    activeSession,
    interviewQueue,
    currentQuestionIndex,
    isInterviewRunning,
    isPaused,
    activeAttemptScorecard,
    profile,
    settings,
    questions,
    startInterview,
    submitAnswerAttempt,
    nextQuestion,
    pauseInterview,
    resumeInterview,
    finishInterview,
    abandonInterview,
    clearActiveScorecard,
  } = useAppStore();

  // Mode Selection State
  const [selectedMode, setSelectedMode] = useState<InterviewMode>("mode-16");
  const [customSelectedIds, setCustomSelectedIds] = useState<string[]>([]);
  const [isModeModalOpen, setIsModeModalOpen] = useState(!isInterviewRunning && !activeSession);

  // Live Hardware / Analysis State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [visionReady, setVisionReady] = useState(false);
  const [visionStatus, setVisionStatus] = useState<LiveVisionFrameResult>({
    faceDetected: false,
    isFacingScreen: false,
    confidence: 0,
    yawDegrees: 0,
    pitchDegrees: 0,
    rollDegrees: 0,
    statusColor: "grey",
  });
  const [audioVolume, setAudioVolume] = useState(0);
  const [isAudioSpeaking, setIsAudioSpeaking] = useState(false);

  // Question Answer & Timer State
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [questionDurationSec, setQuestionDurationSec] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const [showKeyPointsDrawer, setShowKeyPointsDrawer] = useState(false);

  // Completed Session Result State
  const [isCompletedSessionView, setIsCompletedSessionView] = useState(
    activeSession?.status === "completed"
  );

  // References for animation frame loops & timers
  const animFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion: PreCASQuestion | undefined = interviewQueue[currentQuestionIndex];

  // Initialize hardware and vision service when in an active interview
  useEffect(() => {
    let isMounted = true;

    async function initHardware() {
      if (!isInterviewRunning || !currentQuestion) return;

      // 1. Initialize Camera if enabled
      if (settings.cameraEnabled) {
        try {
          const cam = await cameraService.requestCamera();
          if (videoRef.current && isMounted) {
            videoRef.current.srcObject = cam.stream;
            await videoRef.current.play().catch(() => {});
            setCameraActive(true);
          }
        } catch (err) {
          console.warn("Camera init skipped or denied:", err);
          setCameraActive(false);
        }
      }

      // 2. Initialize Microphone if enabled
      if (settings.micEnabled) {
        try {
          await audioService.requestMicrophone();
          setMicActive(true);
        } catch (err) {
          console.warn("Mic init skipped or denied:", err);
          setMicActive(false);
        }
      }

      // 3. Initialize MediaPipe FaceLandmarker
      try {
        const ready = await visionService.initializeLandmarker();
        if (isMounted) setVisionReady(ready);
      } catch {
        if (isMounted) setVisionReady(false);
      }
    }

    initHardware();

    return () => {
      isMounted = false;
    };
  }, [isInterviewRunning, settings.cameraEnabled, settings.micEnabled]);

  // Handle Question Change: Reset question timer, transcript, start speech & audio tracking
  useEffect(() => {
    if (!isInterviewRunning || !currentQuestion || activeAttemptScorecard) return;

    setTranscript("");
    setInterimTranscript("");
    setQuestionDurationSec(0);

    // Start vision & audio tracking
    visionService.startSessionTracking();
    audioService.startSessionTracking();

    // Start speech recognition
    transcriptionService.startListening((finalText, interimText) => {
      setTranscript(finalText);
      setInterimTranscript(interimText);
    });

    // Speak question aloud via TTS if enabled
    if (settings.ttsEnabled) {
      setIsTTSPlaying(true);
      TranscriptionService.speakText(currentQuestion.title, {
        rate: settings.ttsRate || 1.0,
        voiceName: settings.ttsVoice,
        onEnd: () => setIsTTSPlaying(false),
      });
    }

    // Start Question Timer
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      if (!useAppStore.getState().isPaused) {
        setQuestionDurationSec((prev) => prev + 1);
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      TranscriptionService.stopSpeaking();
    };
  }, [currentQuestionIndex, isInterviewRunning, activeAttemptScorecard]);

  // Live video frame processing loop (runs ~12 fps for optimal CPU performance)
  useEffect(() => {
    if (!isInterviewRunning || !cameraActive || activeAttemptScorecard || isPaused) return;

    let lastProcessTime = 0;
    const processFrame = (now: number) => {
      if (now - lastProcessTime >= 85) {
        // ~12 fps
        lastProcessTime = now;
        if (videoRef.current && videoRef.current.readyState >= 2) {
          const res = visionService.processVideoFrame(videoRef.current, now);
          setVisionStatus(res);
        }

        // Live Audio Features sample
        if (micActive) {
          const audio = audioService.sampleLiveFeatures();
          setAudioVolume(audio.volumePercent);
          setIsAudioSpeaking(audio.isSpeaking);
        }
      }
      animFrameRef.current = requestAnimationFrame(processFrame);
    };

    animFrameRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isInterviewRunning, cameraActive, micActive, activeAttemptScorecard, isPaused]);

  // Clean up all streams when interview completes or component unmounts
  useEffect(() => {
    return () => {
      cameraService.stopCamera();
      audioService.stopMicrophone();
      transcriptionService.stopListening();
      TranscriptionService.stopSpeaking();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Trigger celebration confetti on interview completion
  useEffect(() => {
    if (activeSession?.status === "completed") {
      setIsCompletedSessionView(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [activeSession?.status]);

  const handleStartChosenMode = () => {
    startInterview(selectedMode, selectedMode === "custom" ? customSelectedIds : undefined);
    setIsModeModalOpen(false);
    setIsCompletedSessionView(false);
  };

  const handleToggleTTS = () => {
    if (!currentQuestion) return;
    if (isTTSPlaying) {
      TranscriptionService.stopSpeaking();
      setIsTTSPlaying(false);
    } else {
      setIsTTSPlaying(true);
      TranscriptionService.speakText(currentQuestion.title, {
        rate: settings.ttsRate || 1.0,
        voiceName: settings.ttsVoice,
        onEnd: () => setIsTTSPlaying(false),
      });
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Stop Speech and get full combined transcript
      const finalRecordedTranscript = transcriptionService.stopListening();
      const combinedText = (finalRecordedTranscript || transcript).trim();

      // 2. Stop Audio session tracking & get audio metrics
      const audioMetrics = audioService.stopSessionTracking();

      // 3. Stop Vision session tracking & get attention metrics
      const visualAttention: VisualAttentionAssessment = visionService.finishSessionTracking();

      // 4. Generate Comprehensive Scorecard
      const scorecard = generateQuestionScorecard({
        question: currentQuestion,
        transcript: combinedText,
        durationSec: Math.max(1, questionDurationSec),
        profile,
        settings,
        audioMetrics,
        visualAttention,
      });

      // 5. Save attempt into session and database
      await submitAnswerAttempt(scorecard);
    } catch (err) {
      console.error("Error submitting answer attempt:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryQuestion = () => {
    clearActiveScorecard();
    setTranscript("");
    setInterimTranscript("");
    setQuestionDurationSec(0);
    // Restart listeners
    visionService.startSessionTracking();
    audioService.startSessionTracking();
    transcriptionService.startListening((finalText, interimText) => {
      setTranscript(finalText);
      setInterimTranscript(interimText);
    });
  };

  const handleNextQuestion = () => {
    clearActiveScorecard();
    nextQuestion();
  };

  const handleRestartInterview = () => {
    if (confirm("Are you sure you want to restart the interview from Question 1?")) {
      if (activeSession) {
        startInterview(activeSession.mode);
        clearActiveScorecard();
      }
    }
  };

  const handleFinishEarly = async () => {
    if (confirm("Do you want to finish the mock interview now and review your final results?")) {
      const completed = await finishInterview();
      if (completed) {
        setIsCompletedSessionView(true);
      }
    }
  };

  // If no interview is running and user closes modal, show launcher card
  if (!isInterviewRunning && !isCompletedSessionView) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="text-center p-8 sm:p-12">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-brand-500/10">
            <Video className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Pre-CAS Mock Interview Room
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-2 leading-relaxed">
            Simulate a realistic UK university interview. Answer questions using your microphone while facial landmarks assess your visual attention.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 text-left">
            <button
              onClick={() => {
                setSelectedMode("mode-16");
                startInterview("mode-16");
              }}
              className="p-5 rounded-2xl border-2 border-slate-200 dark:border-navy-700 hover:border-brand-500 dark:hover:border-brand-500 transition-all bg-white dark:bg-navy-900 group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600 mb-3 group-hover:scale-105 transition-transform">
                <Play className="w-5 h-5 fill-current" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">16 Questions Practice</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Core balanced mock interview. (~25 mins)
              </p>
            </button>

            <button
              onClick={() => {
                setSelectedMode("mode-20");
                startInterview("mode-20");
              }}
              className="p-5 rounded-2xl border-2 border-slate-200 dark:border-navy-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all bg-white dark:bg-navy-900 group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Full 20 Questions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                All 20 Pre-CAS categories. (~35 mins)
              </p>
            </button>

            <button
              onClick={() => setIsModeModalOpen(true)}
              className="p-5 rounded-2xl border-2 border-slate-200 dark:border-navy-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all bg-white dark:bg-navy-900 group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600 mb-3 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Custom Interview</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select specific questions or categories.
              </p>
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-500" /> Real-time Landmark Gaze
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-emerald-500" /> Speech & Pause Analysis
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-brand-500" /> Instant Scorecard
            </span>
          </div>
        </Card>

        {/* Custom Mode Setup Modal */}
        <Modal
          isOpen={isModeModalOpen}
          onClose={() => setIsModeModalOpen(false)}
          title="Select Interview Mode"
          description="Configure your practice session"
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {(["mode-16", "mode-20", "custom"] as InterviewMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMode(m)}
                  className={`p-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                    selectedMode === m
                      ? "border-brand-600 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300"
                      : "border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {m.replace("-", " ")}
                </button>
              ))}
            </div>

            {selectedMode === "custom" && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select questions to include:
                </p>
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-2">
                  {questions.map((q) => {
                    const checked = customSelectedIds.includes(q.id);
                    return (
                      <label
                        key={q.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-navy-800 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-navy-700"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCustomSelectedIds([...customSelectedIds, q.id]);
                            } else {
                              setCustomSelectedIds(customSelectedIds.filter((id) => id !== q.id));
                            }
                          }}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span className="font-semibold text-slate-900 dark:text-white">#{q.number}</span>
                        <span className="truncate text-slate-700 dark:text-slate-300">{q.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
              <Button variant="outline" size="sm" onClick={() => setIsModeModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleStartChosenMode}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold"
              >
                Launch Interview
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // ==========================================
  // Completed Session Result View
  // ==========================================
  if (isCompletedSessionView && activeSession) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="text-center p-6 sm:p-8 bg-gradient-to-b from-white to-slate-50 dark:from-navy-900 dark:to-navy-950 border-brand-500/20">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
            <Award className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            Mock Interview Completed
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Pre-CAS Interview Scorecard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Completed on {new Date(activeSession.completedAt || activeSession.startedAt).toLocaleString()}
          </p>

          {/* Big Score Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8 p-5 rounded-2xl bg-slate-50/80 dark:bg-navy-850/60 border border-slate-200/80 dark:border-navy-700/60">
            <ScoreGauge
              score={activeSession.overallScore}
              size="md"
              label="Overall Score"
              sublabel="Weighted Pre-CAS"
            />
            <ScoreGauge
              score={activeSession.averageQualityScore}
              size="md"
              label="Answer Quality"
              sublabel="Relevance & Depth"
            />
            <ScoreGauge
              score={activeSession.averageFluencyScore}
              size="md"
              label="English Fluency"
              sublabel="Pacing & Fillers"
            />
            <ScoreGauge
              score={activeSession.averageAttentionScore}
              size="md"
              label="Visual Attention"
              sublabel="Gaze Consistency"
            />
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => {
                setIsCompletedSessionView(false);
                startInterview("mode-16");
              }}
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Practice Again
            </Button>
            <Link href="/analytics">
              <Button variant="outline" size="sm" className="text-xs">
                View Performance Analytics <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="outline" size="sm" className="text-xs">
                View in History
              </Button>
            </Link>
          </div>
        </Card>

        {/* Question-by-Question Attempt Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Question-by-Question Breakdown</CardTitle>
            <CardDescription>
              {activeSession.questionAttempts.length} questions attempted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100 dark:divide-navy-800">
              {activeSession.questionAttempts.map((att, idx) => (
                <div key={att.id} className="py-4 space-y-2 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                          #{idx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                          {att.questionTitle}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        "{att.keyTakeaway}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {att.overallScore}%
                        </span>
                        <p className="text-[10px] text-slate-400">Score</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1 text-slate-500 dark:text-slate-400">
                    <span className="bg-slate-50 dark:bg-navy-800 p-1.5 rounded-lg">
                      Quality: <strong className="text-slate-800 dark:text-slate-200">{att.quality.overallQualityScore}%</strong>
                    </span>
                    <span className="bg-slate-50 dark:bg-navy-800 p-1.5 rounded-lg">
                      Fluency: <strong className="text-slate-800 dark:text-slate-200">{att.fluency.overallFluencyScore}%</strong> (~{att.fluency.speakingPaceWpm} WPM)
                    </span>
                    <span className="bg-slate-50 dark:bg-navy-800 p-1.5 rounded-lg">
                      Attention: <strong className="text-slate-800 dark:text-slate-200">{att.visualAttention.available ? `${att.visualAttention.overallAttentionScore}%` : "N/A"}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==========================================
  // Live Interview Room Screen
  // ==========================================
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Interview Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
            {currentQuestionIndex + 1}/{interviewQueue.length}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Question {currentQuestionIndex + 1} of {interviewQueue.length}
              </span>
              <Badge variant="indigo" size="sm">
                {CATEGORY_LABELS[currentQuestion?.category || ""]?.label || currentQuestion?.category}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Target duration: ~{currentQuestion?.recommendedDurationSec || 90}s
            </p>
          </div>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Question Elapsed Timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold ${
              questionDurationSec > (currentQuestion?.recommendedDurationSec || 90) + 20
                ? "bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400"
                : "bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {Math.floor(questionDurationSec / 60)}:
              {(questionDurationSec % 60).toString().padStart(2, "0")}
            </span>
          </div>

          {/* Pause / Resume */}
          <Button
            variant="outline"
            size="sm"
            onClick={isPaused ? resumeInterview : pauseInterview}
            className="text-xs"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 mr-1" /> : <Pause className="w-3.5 h-3.5 mr-1" />}
            <span>{isPaused ? "Resume" : "Pause"}</span>
          </Button>

          {/* Restart */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRestartInterview}
            title="Restart Interview"
            className="text-slate-400 hover:text-slate-600"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          {/* Finish Early */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleFinishEarly}
            className="text-xs text-rose-600 hover:text-rose-700"
          >
            End Mock
          </Button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5 cols): Interviewer Panel */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Interviewer Avatar & Voice Wave Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-700/60">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-brand-500/20">
                      UK
                    </div>
                    {isTTSPlaying && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      University Pre-CAS Officer
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {profile.intendedUniversity || "UK University"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleToggleTTS}
                  className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 hover:bg-brand-100 transition-colors"
                  title={isTTSPlaying ? "Pause Question Audio" : "Listen to Question"}
                >
                  {isTTSPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Prominent Question Display */}
              <div>
                <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                  Current Question
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                  "{currentQuestion?.title}"
                </h2>
              </div>

              {/* What Interviewer Expects */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/80 dark:border-navy-700/50">
                <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-brand-500" />
                  What the Interviewer Expects
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentQuestion?.expectedWhat}
                </p>
              </div>

              {/* Toggleable Expected Answer Points Drawer */}
              <div>
                <button
                  onClick={() => setShowKeyPointsDrawer(!showKeyPointsDrawer)}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline"
                >
                  <span>{showKeyPointsDrawer ? "Hide Key Points & Structure" : "Show Key Points & Structure"}</span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      showKeyPointsDrawer ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {showKeyPointsDrawer && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-navy-800/40 border border-slate-200/80 dark:border-navy-700/40 space-y-2 text-xs">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Key Points to Include:
                    </p>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                      {currentQuestion?.keyPoints.map((kp, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Context Reminder */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 text-[11px] text-slate-400">
              <span className="font-medium text-slate-600 dark:text-slate-300">
                Profile alignment:
              </span>{" "}
              {profile.fullName} • {profile.intendedProgramme} • Sponsor: {profile.sponsorName}
            </div>
          </Card>
        </div>

        {/* Right Column (7 cols): Live Webcam, Visual Attention & Speech Recording */}
        <div className="lg:col-span-7 space-y-4">
          {/* Webcam Preview Box with Real-time Landmark Gaze Badge */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-navy-700/80 shadow-md">
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay
              className={`w-full h-full object-cover transform -scale-x-100 ${
                !cameraActive ? "hidden" : ""
              }`}
            />

            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                <VideoOff className="w-12 h-12 mb-2 text-slate-600" />
                <p className="text-sm font-semibold text-slate-300">Webcam Not Active</p>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Camera is optional. Your spoken response and answer quality will be assessed non-punitively.
                </p>
              </div>
            )}

            {/* Top Left: Visual Attention Status Badge */}
            {cameraActive && (
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-md ${
                    visionStatus.statusColor === "green"
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                      : visionStatus.statusColor === "yellow"
                      ? "bg-amber-950/80 text-amber-300 border border-amber-500/40"
                      : visionStatus.statusColor === "red"
                      ? "bg-rose-950/80 text-rose-300 border border-rose-500/40"
                      : "bg-slate-900/80 text-slate-300 border border-slate-700"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>
                    {visionStatus.statusColor === "green"
                      ? "Screen-Facing"
                      : visionStatus.statusColor === "yellow"
                      ? "Attention Shift"
                      : visionStatus.statusColor === "red"
                      ? "Looking Away"
                      : "Tracking..."}
                  </span>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white/80 font-mono">
                  Yaw: {visionStatus.yawDegrees}° Pitch: {visionStatus.pitchDegrees}°
                </div>
              </div>
            )}

            {/* Bottom Right: Audio Level Meter inside Video */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs text-white">
              <Mic
                className={`w-3.5 h-3.5 ${
                  isAudioSpeaking ? "text-emerald-400 animate-pulse" : "text-slate-400"
                }`}
              />
              <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-75"
                  style={{ width: `${Math.min(100, audioVolume * 1.5)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Real-time Spoken Transcript & Editor */}
          <Card>
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Live Spoken Transcript
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({transcript.split(/\s+/).filter(Boolean).length} words)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  You can edit text before submitting
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <textarea
                rows={4}
                value={transcript + (interimTranscript ? " " + interimTranscript : "")}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  setInterimTranscript("");
                  transcriptionService.setManualTranscript(e.target.value);
                }}
                placeholder="Speak into your microphone. Your answer will transcribe here in real time, or you can type directly as a reliable fallback..."
                className="w-full p-3 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans leading-relaxed"
              />

              {/* Submit Button & Warning */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {questionDurationSec < 15
                    ? "Tip: Pre-CAS answers typically take 60-90 seconds."
                    : "Ready to submit your response for instant rubric evaluation."}
                </p>

                <Button
                  onClick={handleSubmitAnswer}
                  loading={isSubmitting}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 shadow-md shadow-brand-500/20"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Submit Answer & Review Scorecard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ========================================================= */}
      {/* Immediate Post-Submission Question Scorecard Modal       */}
      {/* ========================================================= */}
      {activeAttemptScorecard && (
        <Modal
          isOpen={!!activeAttemptScorecard}
          onClose={() => {}}
          title={`Scorecard — Question #${activeAttemptScorecard.questionNumber}`}
          description={activeAttemptScorecard.questionTitle}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            {/* Top Score Summary Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-navy-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-brand-500/20">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brand-300 uppercase tracking-wider">
                  Question Performance
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  Answer Score: {activeAttemptScorecard.overallScore}/100
                </h3>
                <p className="text-xs text-slate-300 italic">
                  "{activeAttemptScorecard.keyTakeaway}"
                </p>
                {activeAttemptScorecard.isWeightedWithoutCamera && (
                  <p className="text-[10px] text-amber-300 mt-1">
                    ℹ️ Camera was inactive: score normalized across Answer Quality & Fluency (non-punitive).
                  </p>
                )}
              </div>
              <ScoreGauge
                score={activeAttemptScorecard.overallScore}
                size="md"
                showPercent={false}
              />
            </div>

            {/* Three Assessment Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Pillar 1: Answer Quality */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Answer Quality
                  </span>
                  <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400">
                    {activeAttemptScorecard.quality.overallQualityScore}%
                  </span>
                </div>
                <ProgressBar
                  value={activeAttemptScorecard.quality.overallQualityScore}
                  showValue={false}
                  size="sm"
                  color="indigo"
                />
                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span>Relevance:</span>
                    <span className="font-semibold">{activeAttemptScorecard.quality.relevanceScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Structure:</span>
                    <span className="font-semibold">{activeAttemptScorecard.quality.structureScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completeness:</span>
                    <span className="font-semibold">{activeAttemptScorecard.quality.completenessScore}%</span>
                  </div>
                </div>
              </div>

              {/* Pillar 2: English Fluency */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    English Fluency
                  </span>
                  <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400">
                    {activeAttemptScorecard.fluency.overallFluencyScore}%
                  </span>
                </div>
                <ProgressBar
                  value={activeAttemptScorecard.fluency.overallFluencyScore}
                  showValue={false}
                  size="sm"
                  color="emerald"
                />
                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span>Speaking Pace:</span>
                    <span className="font-semibold">{activeAttemptScorecard.fluency.speakingPaceWpm} WPM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Filler Words:</span>
                    <span className="font-semibold">{activeAttemptScorecard.fluency.fillerWordCount} count</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pauses:</span>
                    <span className="font-semibold">{activeAttemptScorecard.fluency.pauseCount} detected</span>
                  </div>
                </div>
              </div>

              {/* Pillar 3: Visual Attention */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Visual Attention
                  </span>
                  <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400">
                    {activeAttemptScorecard.visualAttention.available
                      ? `${activeAttemptScorecard.visualAttention.overallAttentionScore}%`
                      : "N/A"}
                  </span>
                </div>
                <ProgressBar
                  value={
                    activeAttemptScorecard.visualAttention.available
                      ? activeAttemptScorecard.visualAttention.overallAttentionScore
                      : 0
                  }
                  showValue={false}
                  size="sm"
                  color="purple"
                />
                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span>Screen-Facing:</span>
                    <span className="font-semibold">
                      {activeAttemptScorecard.visualAttention.screenFacingConsistencyPercent}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Face Visibility:</span>
                    <span className="font-semibold">
                      {activeAttemptScorecard.visualAttention.faceVisibilityPercent}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Looking-Away Events:</span>
                    <span className="font-semibold">
                      {activeAttemptScorecard.visualAttention.lookingAwayEvents}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Feedback & Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Positive Feedback */}
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 space-y-2">
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  What You Did Well
                </h4>
                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {activeAttemptScorecard.quality.positiveFeedback.map((pf, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{pf}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{activeAttemptScorecard.fluency.feedback[0] || "Good cadence."}</span>
                  </li>
                </ul>
              </div>

              {/* Opportunities for Improvement */}
              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 space-y-2">
                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Practical Improvements
                </h4>
                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {activeAttemptScorecard.quality.improvementSuggestions.map((imp, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                  {activeAttemptScorecard.fluency.feedback[1] && (
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{activeAttemptScorecard.fluency.feedback[1]}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Transcript Preview */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Submitted Spoken Transcript ({activeAttemptScorecard.fluency.wordCount} words)
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 italic">
                "{activeAttemptScorecard.transcript}"
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-navy-800">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryQuestion}
                className="text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Practice Same Question Again
              </Button>

              <Button
                size="sm"
                onClick={handleNextQuestion}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-5"
              >
                <span>
                  {currentQuestionIndex + 1 < interviewQueue.length
                    ? "Continue to Next Question"
                    : "Finish Mock Interview"}
                </span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
