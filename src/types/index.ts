export type QuestionCategory =
  | 'personal-background'
  | 'course-and-university'
  | 'uk-study-motivation'
  | 'academic-and-professional-plans'
  | 'financial-readiness'
  | 'accommodation-and-student-life'
  | 'final-assessment';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface PreCASQuestion {
  id: string;
  number: number;
  title: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  expectedWhat: string;
  keyPoints: string[];
  commonMistakes: string[];
  recommendedDurationSec: number;
  suggestedStructure: {
    stage: string;
    guidance: string;
  }[];
  keywords: string[];
  isCustom?: boolean;
  isFavorite?: boolean;
  lastPracticed?: string;
  timesPracticed?: number;
}

export interface StudentProfile {
  fullName: string;
  country: string;
  previousUniversity: string;
  previousDegree: string;
  graduationYear: string;
  academicResults: string;
  currentProfession: string;
  workExperienceYears: string;
  intendedUniversity: string;
  intendedProgramme: string;
  courseModules: string[];
  careerGoals: string;
  fundingSource: 'self' | 'parents' | 'sponsor' | 'bank_loan' | 'scholarship';
  sponsorName: string;
  tuitionFeeAmount: string;
  livingExpensesAmount: string;
  accommodationPlan: string;
  updatedAt: string;
}

export interface AnswerQualityAssessment {
  overallQualityScore: number;
  relevanceScore: number;
  completenessScore: number;
  clarityScore: number;
  structureScore: number;
  specificityScore: number;
  consistencyScore: number;
  matchedKeywords: string[];
  missingImportantPoints: string[];
  positiveFeedback: string[];
  improvementSuggestions: string[];
  structureDetected: {
    hasIntro: boolean;
    hasBody: boolean;
    hasConclusion: boolean;
  };
}

export interface FillerWordDetail {
  word: string;
  count: number;
}

export interface FluencyAssessment {
  overallFluencyScore: number;
  speakingPaceWpm: number;
  speakingPaceScore: number;
  fillerWordCount: number;
  fillerWordDetails: FillerWordDetail[];
  fillerWordControlScore: number;
  pauseCount: number;
  longPauseDurationSec: number;
  continuityScore: number;
  sentenceCount: number;
  sentenceStructureScore: number;
  vocabularyVarietyScore: number;
  uniqueWordRatio: number;
  wordCount: number;
  durationSec: number;
  audioFeaturesAvailable: boolean;
  averageVolumeRms?: number;
  speechToSilenceRatio?: number;
  explanation: string;
  feedback: string[];
}

export interface VisualAttentionAssessment {
  available: boolean;
  overallAttentionScore: number;
  faceVisibilityPercent: number;
  screenFacingConsistencyPercent: number;
  lookingAwayEvents: number;
  trackingAvailabilityPercent: number;
  confidence: number;
  statusColor: 'green' | 'yellow' | 'red' | 'grey';
  statusMessage: string;
  diagnosticNotes?: string;
}

export interface QuestionAttemptScorecard {
  id: string;
  questionId: string;
  questionNumber: number;
  questionTitle: string;
  category: QuestionCategory;
  timestamp: string;
  transcript: string;
  durationSec: number;
  overallScore: number;
  isWeightedWithoutCamera: boolean;
  isWeightedWithoutMic: boolean;
  quality: AnswerQualityAssessment;
  fluency: FluencyAssessment;
  visualAttention: VisualAttentionAssessment;
  keyTakeaway: string;
}

export type InterviewMode = 'mode-16' | 'mode-20' | 'custom';

export interface InterviewSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  mode: InterviewMode;
  totalQuestions: number;
  completedQuestions: number;
  overallScore: number;
  averageQualityScore: number;
  averageFluencyScore: number;
  averageAttentionScore: number;
  questionAttempts: QuestionAttemptScorecard[];
  status: 'in-progress' | 'completed' | 'abandoned';
}

export interface PlatformSettings {
  rubricWeights: {
    quality: number;
    fluency: number;
    attention: number;
  };
  ttsEnabled: boolean;
  ttsVoice: string;
  ttsRate: number;
  cameraEnabled: boolean;
  micEnabled: boolean;
  theme: 'dark' | 'light' | 'system';
  speechRecognitionLanguage: string;
  saveLocalRecordings: boolean;
}

export interface SystemCheckState {
  cameraPermission: 'pending' | 'passed' | 'warning' | 'failed' | 'not-supported';
  cameraResolution: string;
  cameraFps: number;
  faceDetected: 'pending' | 'passed' | 'warning' | 'failed' | 'not-tested';
  lightingQuality: 'good' | 'low' | 'too-bright' | 'unknown';
  micPermission: 'pending' | 'passed' | 'warning' | 'failed' | 'not-supported';
  audioVolume: number; // 0-100 live meter
  silenceDetected: boolean;
  micEchoTest: 'pending' | 'recording' | 'recorded' | 'passed' | 'failed';
  speechRecognitionSupport: 'supported' | 'unsupported';
  mediaRecorderSupport: 'supported' | 'unsupported';
  indexedDBSupport: 'supported' | 'unsupported';
  localStorageSupport: 'supported' | 'unsupported';
  mediaPipeSupport: 'loading' | 'ready' | 'failed';
  overallStatus: 'ready' | 'warning' | 'blocked';
}

