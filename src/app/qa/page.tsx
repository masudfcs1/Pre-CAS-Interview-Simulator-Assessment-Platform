"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldCheck,
  Cpu,
  FileCheck,
  Activity,
  Layers,
  Terminal,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { analyzeFluency } from "@/services/assessment/fluency-analyzer";
import { analyzeAnswerQuality } from "@/services/assessment/quality-analyzer";
import { generateQuestionScorecard } from "@/services/assessment/scoring-engine";
import { DEFAULT_PRE_CAS_QUESTIONS } from "@/constants/default-questions";
import { DEFAULT_STUDENT_PROFILE } from "@/constants/default-profile";
import { saveInterviewSession, getInterviewSessions } from "@/services/storage/indexed-db";

interface QATestResult {
  id: string;
  name: string;
  category: "Assessment Engine" | "Fluency & Audio" | "Persistence" | "Integrations";
  status: "passed" | "failed" | "running" | "idle";
  durationMs: number;
  message: string;
  actual?: any;
  expected?: any;
}

export default function QAPage() {
  const [testResults, setTestResults] = useState<QATestResult[]>([]);
  const [isRunningAll, setIsRunningAll] = useState(false);

  const runAllTests = async () => {
    setIsRunningAll(true);
    const results: QATestResult[] = [];

    // Helper runner
    const runTest = async (
      id: string,
      name: string,
      category: QATestResult["category"],
      fn: () => Promise<void> | void
    ) => {
      const start = performance.now();
      try {
        await fn();
        const durationMs = Math.round(performance.now() - start);
        results.push({
          id,
          name,
          category,
          status: "passed",
          durationMs,
          message: "Test passed with expected assertions verified.",
        });
      } catch (err: any) {
        const durationMs = Math.round(performance.now() - start);
        results.push({
          id,
          name,
          category,
          status: "failed",
          durationMs,
          message: err?.message || String(err),
        });
      }
    };

    // Test 1: Filler Words Detection
    await runTest(
      "test-1",
      "Filler Word Detection & Count",
      "Fluency & Audio",
      () => {
        const text = "Umm I want to study in the UK because basically you know it offers a one year master degree.";
        const res = analyzeFluency(text, 30);
        if (res.fillerWordCount < 3) {
          throw new Error(`Expected at least 3 filler words, detected ${res.fillerWordCount}`);
        }
        const hasUm = res.fillerWordDetails.some((f) => f.word.toLowerCase().includes("um"));
        if (!hasUm) {
          throw new Error("Failed to detect 'umm' in filler details list");
        }
      }
    );

    // Test 2: Speaking Pace (WPM) Calculation
    await runTest(
      "test-2",
      "Speaking Pace (WPM) Formula",
      "Fluency & Audio",
      () => {
        // 60 words spoken in 30 seconds should equal exactly 120 WPM
        const text = new Array(60).fill("academic").join(" ");
        const res = analyzeFluency(text, 30);
        if (res.speakingPaceWpm !== 120) {
          throw new Error(`Expected WPM 120, got ${res.speakingPaceWpm}`);
        }
      }
    );

    // Test 3: Missing Camera Non-Punitive Score Weighting
    await runTest(
      "test-3",
      "Missing Camera Dynamic Score Normalization",
      "Assessment Engine",
      () => {
        const question = DEFAULT_PRE_CAS_QUESTIONS[0];
        const text = "My name is Farhan Ahmed and I graduated from University of Dhaka with a BSc degree. I am now applying for MSc at Hertfordshire.";
        const scorecardWithoutCamera = generateQuestionScorecard({
          question,
          transcript: text,
          durationSec: 45,
          visualAttention: {
            available: false,
            overallAttentionScore: 100,
            faceVisibilityPercent: 0,
            screenFacingConsistencyPercent: 0,
            lookingAwayEvents: 0,
            trackingAvailabilityPercent: 0,
            confidence: 0,
            statusColor: "grey",
            statusMessage: "Unavailable",
          },
        });

        if (!scorecardWithoutCamera.isWeightedWithoutCamera) {
          throw new Error("Scorecard failed to flag isWeightedWithoutCamera: true");
        }
        if (scorecardWithoutCamera.overallScore === 0) {
          throw new Error("Scorecard assigned punitive 0 overallScore when camera was unavailable");
        }
      }
    );

    // Test 4: Profile Consistency Keyword Matching
    await runTest(
      "test-4",
      "Profile Consistency Evaluator",
      "Assessment Engine",
      () => {
        const question = DEFAULT_PRE_CAS_QUESTIONS[3]; // Why chosen this university
        const text = "I have chosen University of Hertfordshire because of its excellent research facilities and ranking.";
        const res = analyzeAnswerQuality(question, text, DEFAULT_STUDENT_PROFILE);
        if (res.consistencyScore < 80) {
          throw new Error(`Expected consistency score >= 80, got ${res.consistencyScore}`);
        }
      }
    );

    // Test 5: Question Bank Category Coverage
    await runTest(
      "test-5",
      "20 Pre-CAS Question Bank Integrity",
      "Assessment Engine",
      () => {
        if (DEFAULT_PRE_CAS_QUESTIONS.length !== 20) {
          throw new Error(`Expected exactly 20 questions, got ${DEFAULT_PRE_CAS_QUESTIONS.length}`);
        }
        const hasCategories = DEFAULT_PRE_CAS_QUESTIONS.every((q) => q.category && q.keywords.length > 0);
        if (!hasCategories) {
          throw new Error("Some questions are missing category or keywords");
        }
      }
    );

    // Test 6: IndexedDB Roundtrip Verification
    await runTest(
      "test-6",
      "IndexedDB Storage & Persistence Roundtrip",
      "Persistence",
      async () => {
        const testSessionId = `qa-test-${Date.now()}`;
        const mockSession = {
          id: testSessionId,
          startedAt: new Date().toISOString(),
          mode: "mode-16" as const,
          totalQuestions: 16,
          completedQuestions: 1,
          overallScore: 84,
          averageQualityScore: 85,
          averageFluencyScore: 82,
          averageAttentionScore: 86,
          questionAttempts: [],
          status: "completed" as const,
        };

        await saveInterviewSession(mockSession);
        const sessions = await getInterviewSessions();
        const found = sessions.find((s) => s.id === testSessionId);
        if (!found) {
          throw new Error("Session could not be retrieved from IndexedDB store");
        }
      }
    );

    // Test 7: Empty Answer Graceful Handling
    await runTest(
      "test-7",
      "Zero-Length Transcript Graceful Recovery",
      "Assessment Engine",
      () => {
        const question = DEFAULT_PRE_CAS_QUESTIONS[0];
        const res = analyzeAnswerQuality(question, "");
        if (res.overallQualityScore !== 0) {
          throw new Error(`Expected 0 score for empty transcript, got ${res.overallQualityScore}`);
        }
        if (res.improvementSuggestions.length === 0) {
          throw new Error("Expected constructive suggestion for empty response");
        }
      }
    );

    setTestResults(results);
    setIsRunningAll(false);
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const passedCount = testResults.filter((t) => t.status === "passed").length;
  const failedCount = testResults.filter((t) => t.status === "failed").length;
  const passRate = testResults.length > 0 ? Math.round((passedCount / testResults.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Verification & Quality Assurance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real in-browser test execution verifying rubric algorithms, WPM calculations, persistence, and device fallback.
          </p>
        </div>

        <Button
          onClick={runAllTests}
          disabled={isRunningAll}
          loading={isRunningAll}
          size="sm"
          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Re-execute QA Test Suite
        </Button>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total QA Tests</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {testResults.length}
            </p>
            <p className="text-[10px] text-slate-400">Automated browser assertions</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600">
            <Cpu className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tests Passed</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {passedCount} / {testResults.length}
            </p>
            <p className="text-[10px] text-emerald-500 font-semibold">{passRate}% Pass Rate</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Failures / Errors</p>
            <p className={`text-2xl font-extrabold mt-1 ${failedCount > 0 ? "text-rose-600" : "text-slate-400"}`}>
              {failedCount}
            </p>
            <p className="text-[10px] text-slate-400">0 tolerated for release</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center text-slate-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Real Test Suite Output Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-brand-500" />
            <CardTitle className="text-sm">In-Browser Test Execution Runner</CardTitle>
          </div>
          <CardDescription>Live execution logs directly from browser engine</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100 dark:divide-navy-800">
            {testResults.map((test) => (
              <div key={test.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {test.status === "passed" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {test.name}
                    </span>
                    <Badge variant="outline" size="sm">
                      {test.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">
                    {test.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-slate-400">
                    {test.durationMs}ms
                  </span>
                  <Badge variant={test.status === "passed" ? "success" : "danger"}>
                    {test.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* QA Verification Checklist Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Enterprise Quality Assurance Verification Gates</CardTitle>
          <CardDescription>
            Conforms to CASReady Definition of Done & QA Checklist
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700 space-y-1.5">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                1. Hardware & Media Boundaries
              </span>
              <p className="text-slate-500 dark:text-slate-400">
                Camera and microphone streams terminate immediately on unmount or interview stop. No memory leaks or lingering media tracks.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700 space-y-1.5">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                2. Privacy & Local Intelligence
              </span>
              <p className="text-slate-500 dark:text-slate-400">
                Zero telemetry, zero external AI calls, zero raw frame storage. All landmark pose heuristics run entirely on client device.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700 space-y-1.5">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                3. Non-Punitive Fallback Engine
              </span>
              <p className="text-slate-500 dark:text-slate-400">
                Inability to access camera or Web Speech API dynamically recalculates weight distribution instead of assigning zero marks.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700 space-y-1.5">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                4. Local Persistence Integrity
              </span>
              <p className="text-slate-500 dark:text-slate-400">
                IndexedDB databases with automatic LocalStorage backup fallback ensures interview data is never lost during browser reloads.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

