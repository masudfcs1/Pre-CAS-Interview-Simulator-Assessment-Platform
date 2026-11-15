import { create } from "zustand";
import {
  PreCASQuestion,
  StudentProfile,
  InterviewSession,
  QuestionAttemptScorecard,
  PlatformSettings,
  InterviewMode,
  SystemCheckState,
} from "@/types";
import {
  loadStudentProfile,
  saveStudentProfile,
  loadPlatformSettings,
  savePlatformSettings,
  loadQuestions,
  saveQuestions,
  resetQuestionsToDefault,
} from "@/services/storage/local-storage";
import {
  getInterviewSessions,
  saveInterviewSession,
  saveQuestionAttempt,
  deleteInterviewSession,
} from "@/services/storage/indexed-db";

interface AppState {
  // Profile & Settings
  profile: StudentProfile;
  settings: PlatformSettings;
  updateProfile: (profile: Partial<StudentProfile>) => void;
  updateSettings: (settings: Partial<PlatformSettings>) => void;

  // Questions Bank
  questions: PreCASQuestion[];
  searchQuery: string;
  selectedCategory: string;
  selectedDifficulty: string;
  showFavoritesOnly: boolean;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (cat: string) => void;
  setSelectedDifficulty: (diff: string) => void;
  setShowFavoritesOnly: (fav: boolean) => void;
  toggleFavoriteQuestion: (id: string) => void;
  addCustomQuestion: (question: Omit<PreCASQuestion, "id" | "number" | "isCustom">) => void;
  updateQuestion: (id: string, updates: Partial<PreCASQuestion>) => void;
  deleteCustomQuestion: (id: string) => void;
  resetQuestions: () => void;

  // Active Interview Session
  activeSession: InterviewSession | null;
  interviewQueue: PreCASQuestion[];
  currentQuestionIndex: number;
  isInterviewRunning: boolean;
  isPaused: boolean;
  activeAttemptScorecard: QuestionAttemptScorecard | null;
  startInterview: (mode: InterviewMode, customQuestionIds?: string[]) => void;
  submitAnswerAttempt: (scorecard: QuestionAttemptScorecard) => Promise<void>;
  nextQuestion: () => void;
  pauseInterview: () => void;
  resumeInterview: () => void;
  finishInterview: () => Promise<InterviewSession | null>;
  abandonInterview: () => void;
  clearActiveScorecard: () => void;

  // History & Analytics
  pastSessions: InterviewSession[];
  loadPastSessions: () => Promise<void>;
  deleteSession: (id: string) => Promise<void>;

  // System Diagnostics
  systemCheck: SystemCheckState;
  updateSystemCheck: (update: Partial<SystemCheckState>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Profile & Settings
  profile: loadStudentProfile(),
  settings: loadPlatformSettings(),
  updateProfile: (profileUpdate) => {
    const updated = { ...get().profile, ...profileUpdate, updatedAt: new Date().toISOString() };
    saveStudentProfile(updated);
    set({ profile: updated });
  },
  updateSettings: (settingsUpdate) => {
    const updated = { ...get().settings, ...settingsUpdate };
    savePlatformSettings(updated);
    if (updated.theme) {
      if (typeof document !== "undefined") {
        if (updated.theme === "dark") {
          document.documentElement.classList.add("dark");
        } else if (updated.theme === "light") {
          document.documentElement.classList.remove("dark");
        }
      }
    }
    set({ settings: updated });
  },

  // Questions
  questions: loadQuestions(),
  searchQuery: "",
  selectedCategory: "all",
  selectedDifficulty: "all",
  showFavoritesOnly: false,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSelectedDifficulty: (selectedDifficulty) => set({ selectedDifficulty }),
  setShowFavoritesOnly: (showFavoritesOnly) => set({ showFavoritesOnly }),
  toggleFavoriteQuestion: (id) => {
    const updated = get().questions.map((q) =>
      q.id === id ? { ...q, isFavorite: !q.isFavorite } : q
    );
    saveQuestions(updated);
    set({ questions: updated });
  },
  addCustomQuestion: (newQ) => {
    const questions = get().questions;
    const nextNumber = questions.length + 1;
    const created: PreCASQuestion = {
      ...newQ,
      id: `custom-q-${Date.now()}`,
      number: nextNumber,
      isCustom: true,
      timesPracticed: 0,
    };
    const updated = [...questions, created];
    saveQuestions(updated);
    set({ questions: updated });
  },
  updateQuestion: (id, updates) => {
    const updated = get().questions.map((q) => (q.id === id ? { ...q, ...updates } : q));
    saveQuestions(updated);
    set({ questions: updated });
  },
  deleteCustomQuestion: (id) => {
    const updated = get().questions.filter((q) => q.id !== id);
    saveQuestions(updated);
    set({ questions: updated });
  },
  resetQuestions: () => {
    const defaults = resetQuestionsToDefault();
    set({ questions: defaults });
  },

  // Active Interview Session
  activeSession: null,
  interviewQueue: [],
  currentQuestionIndex: 0,
  isInterviewRunning: false,
  isPaused: false,
  activeAttemptScorecard: null,

  startInterview: (mode, customQuestionIds) => {
    const allQuestions = get().questions;
    let selected: PreCASQuestion[] = [];

    if (mode === "mode-16") {
      // Pick 16 balanced questions across categories
      selected = allQuestions.slice(0, 16);
    } else if (mode === "mode-20") {
      selected = allQuestions.slice(0, 20);
    } else if (mode === "custom" && customQuestionIds && customQuestionIds.length > 0) {
      selected = allQuestions.filter((q) => customQuestionIds.includes(q.id));
    } else {
      selected = allQuestions.slice(0, 5); // default custom
    }

    const session: InterviewSession = {
      id: `session-${Date.now()}`,
      startedAt: new Date().toISOString(),
      mode,
      totalQuestions: selected.length,
      completedQuestions: 0,
      overallScore: 0,
      averageQualityScore: 0,
      averageFluencyScore: 0,
      averageAttentionScore: 0,
      questionAttempts: [],
      status: "in-progress",
    };

    set({
      activeSession: session,
      interviewQueue: selected,
      currentQuestionIndex: 0,
      isInterviewRunning: true,
      isPaused: false,
      activeAttemptScorecard: null,
    });
  },

  submitAnswerAttempt: async (scorecard) => {
    const state = get();
    const session = state.activeSession;
    if (!session) return;

    await saveQuestionAttempt(scorecard);

    const attempts = [...session.questionAttempts, scorecard];
    const avgQuality = Math.round(
      attempts.reduce((sum, a) => sum + a.quality.overallQualityScore, 0) / attempts.length
    );
    const avgFluency = Math.round(
      attempts.reduce((sum, a) => sum + a.fluency.overallFluencyScore, 0) / attempts.length
    );
    const validAttention = attempts.filter((a) => a.visualAttention.available);
    const avgAttention = validAttention.length > 0
      ? Math.round(validAttention.reduce((sum, a) => sum + a.visualAttention.overallAttentionScore, 0) / validAttention.length)
      : 85;
    const avgOverall = Math.round(
      attempts.reduce((sum, a) => sum + a.overallScore, 0) / attempts.length
    );

    const updatedSession: InterviewSession = {
      ...session,
      completedQuestions: attempts.length,
      overallScore: avgOverall,
      averageQualityScore: avgQuality,
      averageFluencyScore: avgFluency,
      averageAttentionScore: avgAttention,
      questionAttempts: attempts,
    };

    await saveInterviewSession(updatedSession);

    // Update times practiced for this question
    const updatedQuestions = state.questions.map((q) =>
      q.id === scorecard.questionId
        ? { ...q, timesPracticed: (q.timesPracticed || 0) + 1, lastPracticed: new Date().toISOString() }
        : q
    );
    saveQuestions(updatedQuestions);

    set({
      activeSession: updatedSession,
      activeAttemptScorecard: scorecard,
      questions: updatedQuestions,
    });
  },

  nextQuestion: () => {
    const { currentQuestionIndex, interviewQueue } = get();
    if (currentQuestionIndex + 1 < interviewQueue.length) {
      set({
        currentQuestionIndex: currentQuestionIndex + 1,
        activeAttemptScorecard: null,
      });
    } else {
      // Completed last question
      get().finishInterview();
    }
  },

  pauseInterview: () => set({ isPaused: true }),
  resumeInterview: () => set({ isPaused: false }),

  finishInterview: async () => {
    const session = get().activeSession;
    if (!session) return null;

    const completedSession: InterviewSession = {
      ...session,
      completedAt: new Date().toISOString(),
      status: "completed",
    };

    await saveInterviewSession(completedSession);
    await get().loadPastSessions();

    set({
      activeSession: completedSession,
      isInterviewRunning: false,
    });

    return completedSession;
  },

  abandonInterview: () => {
    const session = get().activeSession;
    if (session) {
      const abandoned: InterviewSession = {
        ...session,
        completedAt: new Date().toISOString(),
        status: "abandoned",
      };
      saveInterviewSession(abandoned);
    }
    set({
      activeSession: null,
      interviewQueue: [],
      currentQuestionIndex: 0,
      isInterviewRunning: false,
      activeAttemptScorecard: null,
    });
  },

  clearActiveScorecard: () => set({ activeAttemptScorecard: null }),

  // Past Sessions
  pastSessions: [],
  loadPastSessions: async () => {
    const sessions = await getInterviewSessions();
    set({ pastSessions: sessions });
  },
  deleteSession: async (id) => {
    await deleteInterviewSession(id);
    await get().loadPastSessions();
  },

  // System Diagnostics
  systemCheck: {
    cameraPermission: "pending",
    cameraResolution: "1280x720",
    cameraFps: 30,
    faceDetected: "pending",
    lightingQuality: "unknown",
    micPermission: "pending",
    audioVolume: 0,
    silenceDetected: false,
    micEchoTest: "pending",
    speechRecognitionSupport: "supported",
    mediaRecorderSupport: "supported",
    indexedDBSupport: "supported",
    localStorageSupport: "supported",
    mediaPipeSupport: "ready",
    overallStatus: "ready",
  },
  updateSystemCheck: (update) => {
    set((state) => ({
      systemCheck: { ...state.systemCheck, ...update },
    }));
  },
}));

