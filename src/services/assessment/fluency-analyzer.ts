import { FluencyAssessment, FillerWordDetail } from "@/types";

const COMMON_FILLER_WORDS = [
  "umm",
  "um",
  "uh",
  "uhh",
  "actually",
  "basically",
  "you know",
  "like",
  "so",
  "i mean",
  "err",
  "kind of",
  "sort of",
];

export function analyzeFluency(
  transcript: string,
  durationSec: number,
  audioMetrics?: {
    speechDurationMs: number;
    pauseDurationMs: number;
    pauseCount: number;
    speechToSilenceRatio: number;
  }
): FluencyAssessment {
  const cleanText = transcript.trim();
  const words = cleanText ? cleanText.split(/\s+/).filter(w => w.length > 0) : [];
  const wordCount = words.length;
  const safeDurationSec = Math.max(1, durationSec);

  // 1. Speaking Pace (WPM)
  const speakingPaceWpm = Math.round((wordCount / safeDurationSec) * 60);
  let speakingPaceScore = 80;
  if (wordCount === 0) {
    speakingPaceScore = 0;
  } else if (speakingPaceWpm >= 115 && speakingPaceWpm <= 155) {
    speakingPaceScore = 95; // Ideal academic interview cadence
  } else if ((speakingPaceWpm >= 95 && speakingPaceWpm < 115) || (speakingPaceWpm > 155 && speakingPaceWpm <= 175)) {
    speakingPaceScore = 82;
  } else if ((speakingPaceWpm >= 70 && speakingPaceWpm < 95) || (speakingPaceWpm > 175 && speakingPaceWpm <= 195)) {
    speakingPaceScore = 65;
  } else {
    speakingPaceScore = 50;
  }

  // 2. Filler words detection
  const lowerText = cleanText.toLowerCase();
  const fillerDetails: FillerWordDetail[] = [];
  let totalFillers = 0;

  for (const filler of COMMON_FILLER_WORDS) {
    // Word boundary regex for single words or multi-word phrases
    const regex = new RegExp(`\\b${filler}\\b`, "gi");
    const matches = lowerText.match(regex);
    if (matches && matches.length > 0) {
      fillerDetails.push({
        word: filler,
        count: matches.length,
      });
      totalFillers += matches.length;
    }
  }

  // Filler word control score based on filler percentage
  const fillerRatio = wordCount > 0 ? totalFillers / wordCount : 0;
  let fillerWordControlScore = 90;
  if (wordCount === 0) {
    fillerWordControlScore = 100;
  } else if (fillerRatio <= 0.02) {
    fillerWordControlScore = 95;
  } else if (fillerRatio <= 0.05) {
    fillerWordControlScore = 82;
  } else if (fillerRatio <= 0.09) {
    fillerWordControlScore = 68;
  } else {
    fillerWordControlScore = Math.max(40, Math.round(90 - fillerRatio * 450));
  }

  // 3. Pauses and Continuity
  let pauseCount = audioMetrics?.pauseCount || 0;
  const longPauseDurationSec = audioMetrics ? Math.round(audioMetrics.pauseDurationMs / 1000) : 0;
  let continuityScore = 85;

  if (audioMetrics) {
    const silenceRatio = 1 - audioMetrics.speechToSilenceRatio;
    if (silenceRatio > 0.45) {
      continuityScore = 62;
    } else if (silenceRatio > 0.3) {
      continuityScore = 78;
    } else {
      continuityScore = 92;
    }
  } else {
    // Text-based pause heuristic if audio features were unavailable
    const sentenceBreaks = cleanText.split(/[.?!]+/).filter(s => s.trim().length > 0);
    pauseCount = Math.max(0, sentenceBreaks.length - 1);
    continuityScore = wordCount > 30 ? 80 : 60;
  }

  // 4. Sentence structure & length variation
  const sentences = cleanText.split(/[.?!]+/).map(s => s.trim()).filter(s => s.length > 0);
  const sentenceCount = Math.max(1, sentences.length);
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const avgSentenceLength = wordCount / sentenceCount;

  // Good academic communication balances short punchy sentences with compound sentences (12-24 words)
  let sentenceStructureScore = 75;
  const hasVariance = sentenceLengths.some(l => l <= 12) && sentenceLengths.some(l => l >= 18);
  if (wordCount === 0) {
    sentenceStructureScore = 0;
  } else if (avgSentenceLength >= 10 && avgSentenceLength <= 24) {
    sentenceStructureScore = hasVariance ? 92 : 86;
  } else if (avgSentenceLength < 10) {
    sentenceStructureScore = 72; // Too fragmented
  } else {
    sentenceStructureScore = 68; // Too rambling/run-on
  }

  // 5. Vocabulary variety (Type-Token Ratio)
  const normalizedWords = words.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, "")).filter(w => w.length > 0);
  const uniqueWords = new Set(normalizedWords);
  const uniqueWordRatio = normalizedWords.length > 0 ? uniqueWords.size / normalizedWords.length : 0;
  let vocabularyVarietyScore = Math.min(95, Math.round(uniqueWordRatio * 115));
  if (wordCount < 15) vocabularyVarietyScore = Math.min(vocabularyVarietyScore, 55);

  // Overall fluency score (Weighted)
  const overallFluencyScore = wordCount === 0 ? 0 : Math.round(
    speakingPaceScore * 0.25 +
    fillerWordControlScore * 0.25 +
    continuityScore * 0.20 +
    sentenceStructureScore * 0.15 +
    vocabularyVarietyScore * 0.15
  );

  // Explanations and 3 practical improvement suggestions
  const feedback: string[] = [];
  if (speakingPaceWpm < 100 && wordCount > 0) {
    feedback.push("Your speaking speed was slightly hesitant. Practice speaking with greater continuity to reach 125-145 WPM.");
  } else if (speakingPaceWpm > 165) {
    feedback.push("Your pace was fast. Slow down slightly and articulate key UK academic concepts clearly for the interviewer.");
  } else {
    feedback.push("Your speaking speed is well-measured and appropriate for a UK university Pre-CAS interview.");
  }

  if (totalFillers > 3) {
    feedback.push(`You used ${totalFillers} filler words (${fillerDetails.map(f => `"${f.word}" (${f.count})`).join(", ")}). Replace fillers with a brief silent pause.`);
  } else {
    feedback.push("Excellent filler word control; your spoken delivery sounded confident and composed.");
  }

  if (avgSentenceLength > 26) {
    feedback.push("Try using shorter and clearer sentences rather than long run-on phrases to make your answers easier to follow.");
  } else if (uniqueWordRatio < 0.5 && wordCount > 30) {
    feedback.push("Expand your vocabulary variety by incorporating discipline-specific academic terminology.");
  } else {
    feedback.push("Your sentence flow and vocabulary variety demonstrated solid English communication ability.");
  }

  return {
    overallFluencyScore,
    speakingPaceWpm,
    speakingPaceScore,
    fillerWordCount: totalFillers,
    fillerWordDetails: fillerDetails,
    fillerWordControlScore,
    pauseCount,
    longPauseDurationSec,
    continuityScore,
    sentenceCount,
    sentenceStructureScore,
    vocabularyVarietyScore,
    uniqueWordRatio: Number(uniqueWordRatio.toFixed(2)),
    wordCount,
    durationSec: Math.round(safeDurationSec),
    audioFeaturesAvailable: !!audioMetrics,
    speechToSilenceRatio: audioMetrics?.speechToSilenceRatio,
    explanation: `English fluency evaluated across ${wordCount} words at ~${speakingPaceWpm} WPM with ${totalFillers} filler instances detected.`,
    feedback: feedback.slice(0, 3),
  };
}
