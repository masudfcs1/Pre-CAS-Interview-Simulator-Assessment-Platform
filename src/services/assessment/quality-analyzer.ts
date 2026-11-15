import { PreCASQuestion, StudentProfile, AnswerQualityAssessment } from "@/types";

export function analyzeAnswerQuality(
  question: PreCASQuestion,
  transcript: string,
  profile?: StudentProfile
): AnswerQualityAssessment {
  const text = transcript.trim();
  const lowerText = text.toLowerCase();
  const words = text ? text.split(/\s+/).filter(w => w.length > 0) : [];
  const wordCount = words.length;

  if (wordCount === 0) {
    return {
      overallQualityScore: 0,
      relevanceScore: 0,
      completenessScore: 0,
      clarityScore: 0,
      structureScore: 0,
      specificityScore: 0,
      consistencyScore: 0,
      matchedKeywords: [],
      missingImportantPoints: question.keyPoints.slice(0, 3),
      positiveFeedback: [],
      improvementSuggestions: ["No answer was recorded. Speak or type your answer before submitting."],
      structureDetected: { hasIntro: false, hasBody: false, hasConclusion: false },
    };
  }

  // 1. Relevance: match against question keywords and category vocabulary
  const matchedKeywords: string[] = [];
  for (const kw of question.keywords) {
    const kwRegex = new RegExp(`\\b${kw.toLowerCase()}\\b`, "i");
    if (kwRegex.test(lowerText)) {
      matchedKeywords.push(kw);
    }
  }
  const keywordMatchRatio = question.keywords.length > 0 ? matchedKeywords.length / question.keywords.length : 0.5;
  const relevanceScore = Math.min(100, Math.round(40 + keywordMatchRatio * 60));

  // 2. Completeness: assess coverage of key points and overall depth
  // Word count benchmarks: optimal Pre-CAS answer is ~80 - 180 words
  let lengthFactor = 1.0;
  if (wordCount < 30) lengthFactor = 0.5;
  else if (wordCount < 60) lengthFactor = 0.75;
  else if (wordCount > 300) lengthFactor = 0.85;

  const completenessScore = Math.min(100, Math.round((50 + keywordMatchRatio * 50) * lengthFactor));

  // 3. Structure: Introduction, Core Body, Conclusion markers
  const introPatterns = [
    /\b(i am|my name is|firstly|to begin with|regarding|as for|in terms of|i have chosen|the main reason)\b/i,
  ];
  const bodyPatterns = [
    /\b(furthermore|moreover|in addition|for instance|for example|specifically|additionally|such as)\b/i,
  ];
  const conclusionPatterns = [
    /\b(therefore|in conclusion|overall|ultimately|this will allow me|this is why|in summary|looking forward)\b/i,
  ];

  const hasIntro = introPatterns.some(p => p.test(lowerText)) || wordCount >= 25;
  const hasBody = bodyPatterns.some(p => p.test(lowerText)) || wordCount >= 50;
  const hasConclusion = conclusionPatterns.some(p => p.test(lowerText)) || (wordCount >= 70 && sentencesCount(text) >= 3);

  let structureScore = 60;
  if (hasIntro && hasBody && hasConclusion) structureScore = 95;
  else if (hasIntro && (hasBody || hasConclusion)) structureScore = 80;
  else if (hasIntro || hasBody) structureScore = 70;

  // 4. Clarity: sentence structure and lack of circular repetition
  const sentences = text.split(/[.?!]+/).filter(s => s.trim().length > 0);
  const clarityScore = wordCount >= 30 ? Math.min(95, 75 + Math.min(20, sentences.length * 4)) : 60;

  // 5. Specificity: presence of numbers, percentages, currency (£/GBP), proper nouns
  const hasNumbers = /\b\d+(\.\d+)?%?\b/.test(text);
  const hasCurrency = /£|gbp|pounds|euro|dollar|\$/i.test(text);
  const hasProperNouns = /[A-Z][a-z]+/.test(text);

  let specificityScore = 65;
  if (hasNumbers) specificityScore += 12;
  if (hasCurrency) specificityScore += 12;
  if (hasProperNouns) specificityScore += 10;
  specificityScore = Math.min(98, specificityScore);

  // 6. Profile Consistency
  let consistencyScore = 85; // neutral baseline
  if (profile) {
    let checksMatched = 0;
    let checksAttempted = 0;

    if (profile.intendedUniversity && lowerText.includes(profile.intendedUniversity.toLowerCase().split(" ")[0])) {
      checksMatched++;
      checksAttempted++;
    }
    if (profile.country && lowerText.includes(profile.country.toLowerCase())) {
      checksMatched++;
      checksAttempted++;
    }
    if (profile.sponsorName && (lowerText.includes("father") || lowerText.includes("mother") || lowerText.includes("parents") || lowerText.includes("sponsor"))) {
      checksMatched++;
      checksAttempted++;
    }

    if (checksAttempted > 0) {
      consistencyScore = Math.min(100, Math.round(75 + (checksMatched / checksAttempted) * 25));
    }
  }

  // 7. Weighted overall quality score
  // Rubric: Relevance (25%), Completeness (20%), Clarity (20%), Structure (15%), Specificity (10%), Consistency (10%)
  const overallQualityScore = Math.round(
    relevanceScore * 0.25 +
    completenessScore * 0.20 +
    clarityScore * 0.20 +
    structureScore * 0.15 +
    specificityScore * 0.10 +
    consistencyScore * 0.10
  );

  // Missing points
  const missingPoints: string[] = [];
  question.keyPoints.forEach(kp => {
    const keyTerm = kp.split(" ")[0].toLowerCase();
    if (!lowerText.includes(keyTerm)) {
      missingPoints.push(kp);
    }
  });

  // Constructive feedback
  const positiveFeedback: string[] = [];
  const improvementSuggestions: string[] = [];

  if (relevanceScore >= 80) {
    positiveFeedback.push("Answer addressed the central theme of the question directly with relevant UK university terminology.");
  }
  if (structureScore >= 80) {
    positiveFeedback.push("Structured logical response with a coherent narrative flow.");
  }
  if (specificityScore >= 80) {
    positiveFeedback.push("Provided concrete examples, figures, or module specifics rather than vague generalities.");
  }

  if (wordCount < 50) {
    improvementSuggestions.push(`Your response was quite brief (${wordCount} words). Expand on your reasoning to target 80-150 words.`);
  }
  if (missingPoints.length > 0) {
    improvementSuggestions.push(`Include missing key points: ${missingPoints.slice(0, 2).join("; ")}.`);
  }
  if (structureScore < 80) {
    improvementSuggestions.push("Structure your response in three stages: Direct premise, practical evidence/examples, and conclusion.");
  }
  if (question.commonMistakes.length > 0) {
    improvementSuggestions.push(`Beware of typical pitfall: ${question.commonMistakes[0]}`);
  }

  return {
    overallQualityScore,
    relevanceScore,
    completenessScore,
    clarityScore,
    structureScore,
    specificityScore,
    consistencyScore,
    matchedKeywords,
    missingImportantPoints: missingPoints.slice(0, 3),
    positiveFeedback: positiveFeedback.length > 0 ? positiveFeedback : ["Answer attempted with relevant focus."],
    improvementSuggestions: improvementSuggestions.slice(0, 3),
    structureDetected: { hasIntro, hasBody, hasConclusion },
  };
}

function sentencesCount(text: string): number {
  return text.split(/[.?!]+/).filter(s => s.trim().length > 0).length;
}

