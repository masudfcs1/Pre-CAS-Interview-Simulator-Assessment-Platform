import { describe, it, expect } from "vitest";
import { analyzeFluency } from "@/services/assessment/fluency-analyzer";
import { analyzeAnswerQuality } from "@/services/assessment/quality-analyzer";
import { generateQuestionScorecard } from "@/services/assessment/scoring-engine";
import { DEFAULT_PRE_CAS_QUESTIONS } from "@/constants/default-questions";
import { DEFAULT_STUDENT_PROFILE } from "@/constants/default-profile";

describe("English Fluency Assessment Unit Tests", () => {
  it("detects single and multi-word filler phrases accurately", () => {
    const text = "Umm I actually believe that basically you know the UK is like so good, I mean it offers great value.";
    const result = analyzeFluency(text, 25);

    expect(result.fillerWordCount).toBeGreaterThanOrEqual(5);
    const detectedWords = result.fillerWordDetails.map((f) => f.word.toLowerCase());
    expect(detectedWords).toContain("umm");
    expect(detectedWords).toContain("actually");
    expect(detectedWords).toContain("basically");
    expect(detectedWords).toContain("you know");
    expect(detectedWords).toContain("like");
    expect(detectedWords).toContain("i mean");
  });

  it("calculates speaking pace (WPM) accurately", () => {
    // 130 words in 60 seconds should be 130 WPM
    const words = new Array(130).fill("academic").join(" ");
    const result = analyzeFluency(words, 60);

    expect(result.speakingPaceWpm).toBe(130);
    expect(result.speakingPaceScore).toBe(95); // High score for optimal academic cadence
  });

  it("penalizes overly rushed speaking (> 185 WPM)", () => {
    const words = new Array(210).fill("fast").join(" ");
    const result = analyzeFluency(words, 60);

    expect(result.speakingPaceWpm).toBe(210);
    expect(result.speakingPaceScore).toBeLessThan(60);
  });

  it("handles zero word transcript without throwing", () => {
    const result = analyzeFluency("", 10);
    expect(result.wordCount).toBe(0);
    expect(result.overallFluencyScore).toBe(0);
    expect(result.speakingPaceWpm).toBe(0);
  });

  it("integrates audio silence metrics when provided", () => {
    const text = "This is a fluent response with measured pauses.";
    const resultWithAudio = analyzeFluency(text, 30, {
      speechDurationMs: 24000,
      pauseDurationMs: 6000,
      pauseCount: 3,
      speechToSilenceRatio: 0.8,
    });

    expect(resultWithAudio.audioFeaturesAvailable).toBe(true);
    expect(resultWithAudio.pauseCount).toBe(3);
    expect(resultWithAudio.continuityScore).toBeGreaterThanOrEqual(90);
  });
});

describe("Answer Quality Assessment Unit Tests", () => {
  const sampleQuestion = DEFAULT_PRE_CAS_QUESTIONS[0]; // Tell me about yourself

  it("scores high relevance when keywords are matched", () => {
    const text = "My name is Farhan Ahmed. I graduated with a Bachelor degree in Computer Science from University of Dhaka. I have professional experience as a software engineer and I am passionate about pursuing this Master degree in the UK.";
    const result = analyzeAnswerQuality(sampleQuestion, text, DEFAULT_STUDENT_PROFILE);

    expect(result.relevanceScore).toBeGreaterThanOrEqual(70);
    expect(result.overallQualityScore).toBeGreaterThanOrEqual(70);
    expect(result.matchedKeywords.length).toBeGreaterThan(0);
  });

  it("detects structured answer stages (intro, body, conclusion)", () => {
    const structuredText = "Firstly, regarding my educational background, I completed my undergraduate degree in CSE. Furthermore, I worked in the software industry for two years where I solved complex problems. In summary, this programme will allow me to transition into an AI specialist.";
    const result = analyzeAnswerQuality(sampleQuestion, structuredText);

    expect(result.structureDetected.hasIntro).toBe(true);
    expect(result.structureDetected.hasBody).toBe(true);
    expect(result.structureDetected.hasConclusion).toBe(true);
    expect(result.structureScore).toBeGreaterThanOrEqual(80);
  });

  it("rewards specificity for monetary and numerical data", () => {
    const financeQuestion = DEFAULT_PRE_CAS_QUESTIONS[15]; // Tuition fees and living expenses
    const text = "My total tuition fee is £16,500 and I have already deposited £4,000 as a deposit with the remaining balance ready. For living expenses and maintenance, I require £9,207 under UKVI requirements, which is fully maintained as liquid funds in our bank account for over 28 days.";
    const result = analyzeAnswerQuality(financeQuestion, text);

    expect(result.specificityScore).toBeGreaterThanOrEqual(80);
    expect(result.relevanceScore).toBeGreaterThanOrEqual(70);
  });

  it("identifies missing expected points in brief answers", () => {
    const result = analyzeAnswerQuality(sampleQuestion, "I am a student from Dhaka.");
    expect(result.missingImportantPoints.length).toBeGreaterThan(0);
    expect(result.improvementSuggestions.some((s) => s.includes("brief"))).toBe(true);
  });
});

describe("Master Scoring Engine & Non-Punitive Normalization", () => {
  const sampleQuestion = DEFAULT_PRE_CAS_QUESTIONS[0];

  it("normalizes weights when camera is unavailable without penalizing the user", () => {
    const text = "I am a graduate applying for MSc in Hertfordshire with strong academic foundation.";
    const scorecard = generateQuestionScorecard({
      question: sampleQuestion,
      transcript: text,
      durationSec: 40,
      visualAttention: {
        available: false,
        overallAttentionScore: 100,
        faceVisibilityPercent: 0,
        screenFacingConsistencyPercent: 0,
        lookingAwayEvents: 0,
        trackingAvailabilityPercent: 0,
        confidence: 0,
        statusColor: "grey",
        statusMessage: "Camera tracking not active",
      },
    });

    expect(scorecard.isWeightedWithoutCamera).toBe(true);
    expect(scorecard.overallScore).toBeGreaterThan(0);
    expect(scorecard.visualAttention.available).toBe(false);
  });

  it("includes all 3 assessment pillars in generated scorecard", () => {
    const scorecard = generateQuestionScorecard({
      question: sampleQuestion,
      transcript: "I graduated with a BSc degree and have worked as a developer.",
      durationSec: 30,
      visualAttention: {
        available: true,
        overallAttentionScore: 88,
        faceVisibilityPercent: 94,
        screenFacingConsistencyPercent: 88,
        lookingAwayEvents: 1,
        trackingAvailabilityPercent: 95,
        confidence: 0.9,
        statusColor: "green",
        statusMessage: "Screen facing",
      },
    });

    expect(scorecard.quality).toBeDefined();
    expect(scorecard.fluency).toBeDefined();
    expect(scorecard.visualAttention).toBeDefined();
    expect(scorecard.keyTakeaway).toBeDefined();
  });
});

describe("Pre-CAS Question Bank Integrity Tests", () => {
  it("contains exactly 20 structured default questions", () => {
    expect(DEFAULT_PRE_CAS_QUESTIONS.length).toBe(20);
  });

  it("covers all 7 required UK Pre-CAS categories", () => {
    const categories = new Set(DEFAULT_PRE_CAS_QUESTIONS.map((q) => q.category));
    expect(categories.has("personal-background")).toBe(true);
    expect(categories.has("course-and-university")).toBe(true);
    expect(categories.has("uk-study-motivation")).toBe(true);
    expect(categories.has("academic-and-professional-plans")).toBe(true);
    expect(categories.has("financial-readiness")).toBe(true);
    expect(categories.has("accommodation-and-student-life")).toBe(true);
    expect(categories.has("final-assessment")).toBe(true);
  });

  it("ensures each question has key points, common mistakes, and recommended duration", () => {
    DEFAULT_PRE_CAS_QUESTIONS.forEach((q) => {
      expect(q.title.length).toBeGreaterThan(5);
      expect(q.keyPoints.length).toBeGreaterThanOrEqual(3);
      expect(q.commonMistakes.length).toBeGreaterThanOrEqual(2);
      expect(q.recommendedDurationSec).toBeGreaterThanOrEqual(60);
      expect(q.suggestedStructure.length).toBe(3);
      expect(q.keywords.length).toBeGreaterThanOrEqual(5);
    });
  });
});
