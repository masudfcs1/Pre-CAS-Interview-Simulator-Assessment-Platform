import {
  PreCASQuestion,
  StudentProfile,
  QuestionAttemptScorecard,
  PlatformSettings,
  VisualAttentionAssessment,
  FluencyAssessment,
  AnswerQualityAssessment,
} from "@/types";
import { analyzeAnswerQuality } from "./quality-analyzer";
import { analyzeFluency } from "./fluency-analyzer";

export interface GenerateScorecardParams {
  question: PreCASQuestion;
  transcript: string;
  durationSec: number;
  profile?: StudentProfile;
  settings?: PlatformSettings;
  audioMetrics?: {
    speechDurationMs: number;
    pauseDurationMs: number;
    pauseCount: number;
    speechToSilenceRatio: number;
  };
  visualAttention?: VisualAttentionAssessment;
}

export function generateQuestionScorecard(params: GenerateScorecardParams): QuestionAttemptScorecard {
  const { question, transcript, durationSec, profile, settings, audioMetrics, visualAttention } = params;

  // 1. Analyze Answer Quality
  const quality: AnswerQualityAssessment = analyzeAnswerQuality(question, transcript, profile);

  // 2. Analyze Fluency
  const fluency: FluencyAssessment = analyzeFluency(transcript, durationSec, audioMetrics);

  // 3. Visual Attention fallback handling
  const attention: VisualAttentionAssessment = visualAttention || {
    available: false,
    overallAttentionScore: 100,
    faceVisibilityPercent: 0,
    screenFacingConsistencyPercent: 0,
    lookingAwayEvents: 0,
    trackingAvailabilityPercent: 0,
    confidence: 0,
    statusColor: "grey",
    statusMessage: "Camera tracking was not enabled for this question.",
  };

  // 4. Calculate Combined Score with Dynamic Normalization
  const baseWeights = settings?.rubricWeights || { quality: 40, fluency: 35, attention: 25 };
  const qualityWeight = baseWeights.quality;
  const fluencyWeight = baseWeights.fluency;
  const attentionWeight = attention.available ? baseWeights.attention : 0;

  const isWeightedWithoutCamera = !attention.available;
  const isWeightedWithoutMic = !audioMetrics && transcript.trim().length === 0;

  // Re-normalize weights to sum to 1.0 (100%)
  const totalWeight = qualityWeight + fluencyWeight + attentionWeight;
  let overallScore = 0;

  if (totalWeight > 0) {
    const normQuality = qualityWeight / totalWeight;
    const normFluency = fluencyWeight / totalWeight;
    const normAttention = attentionWeight / totalWeight;

    const weightedScore =
      quality.overallQualityScore * normQuality +
      fluency.overallFluencyScore * normFluency +
      (attention.available ? attention.overallAttentionScore * normAttention : 0);

    overallScore = Math.max(0, Math.min(100, Math.round(weightedScore)));
  }

  // Key takeaway summary sentence
  let keyTakeaway = "Solid preparation demonstrated with room for refinement in academic depth.";
  if (overallScore >= 85) {
    keyTakeaway = "Outstanding performance; response is well-structured, fluent, and highly persuasive for Pre-CAS assessment.";
  } else if (overallScore >= 70) {
    keyTakeaway = "Good baseline answer; incorporate more concrete figures and tighten speaking pacing to excel.";
  } else if (overallScore >= 50) {
    keyTakeaway = "Fair attempt; review the suggested 3-stage structure and expand on missing core points.";
  } else {
    keyTakeaway = "Needs significant development; thoroughly review what the UK university interviewer expects for this question.";
  }

  return {
    id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    questionId: question.id,
    questionNumber: question.number,
    questionTitle: question.title,
    category: question.category,
    timestamp: new Date().toISOString(),
    transcript,
    durationSec: Math.round(durationSec),
    overallScore,
    isWeightedWithoutCamera,
    isWeightedWithoutMic,
    quality,
    fluency,
    visualAttention: attention,
    keyTakeaway,
  };
}
