"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Brain,
  Mic,
  Eye,
  Award,
  Filter,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { CATEGORY_LABELS } from "@/constants/default-questions";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function AnalyticsPage() {
  const { pastSessions, questions } = useAppStore();
  const [sessionCompareA, setSessionCompareA] = useState<string>("");
  const [sessionCompareB, setSessionCompareB] = useState<string>("");

  const completedSessions = useMemo(
    () => pastSessions.filter((s) => s.status === "completed"),
    [pastSessions]
  );

  // Compute live averages
  const overallAvgScore =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((sum, s) => sum + s.overallScore, 0) /
            completedSessions.length
        )
      : 0;

  const avgQuality =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((sum, s) => sum + s.averageQualityScore, 0) /
            completedSessions.length
        )
      : 0;

  const avgFluency =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((sum, s) => sum + s.averageFluencyScore, 0) /
            completedSessions.length
        )
      : 0;

  const avgAttention =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((sum, s) => sum + s.averageAttentionScore, 0) /
            completedSessions.length
        )
      : 0;

  // Progression Line Chart Data
  const trendData = useMemo(() => {
    return [...completedSessions].reverse().map((s, idx) => ({
      name: `S${idx + 1}`,
      date: new Date(s.startedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      overall: s.overallScore,
      quality: s.averageQualityScore,
      fluency: s.averageFluencyScore,
      attention: s.averageAttentionScore,
    }));
  }, [completedSessions]);

  // Speaking Pace & Filler Word Bar Chart Data across recent attempts
  const attemptsMetricsData = useMemo(() => {
    const allAttempts = pastSessions.flatMap((s) => s.questionAttempts);
    return allAttempts.slice(-10).map((att, idx) => ({
      name: `Q#${att.questionNumber}`,
      wpm: att.fluency.speakingPaceWpm,
      fillers: att.fluency.fillerWordCount,
      pauses: att.fluency.pauseCount,
    }));
  }, [pastSessions]);

  // Radar Chart: Readiness Dimensions
  const radarData = useMemo(() => {
    const allAttempts = pastSessions.flatMap((s) => s.questionAttempts);
    if (allAttempts.length === 0) {
      return [
        { subject: "Relevance", score: 0, fullMark: 100 },
        { subject: "Completeness", score: 0, fullMark: 100 },
        { subject: "Structure", score: 0, fullMark: 100 },
        { subject: "Speaking Pace", score: 0, fullMark: 100 },
        { subject: "Filler Control", score: 0, fullMark: 100 },
        { subject: "Visual Attention", score: 0, fullMark: 100 },
      ];
    }

    const avg = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);

    return [
      { subject: "Relevance", score: avg(allAttempts.map((a) => a.quality.relevanceScore)), fullMark: 100 },
      { subject: "Completeness", score: avg(allAttempts.map((a) => a.quality.completenessScore)), fullMark: 100 },
      { subject: "Structure", score: avg(allAttempts.map((a) => a.quality.structureScore)), fullMark: 100 },
      { subject: "Speaking Pace", score: avg(allAttempts.map((a) => a.fluency.speakingPaceScore)), fullMark: 100 },
      { subject: "Filler Control", score: avg(allAttempts.map((a) => a.fluency.fillerWordControlScore)), fullMark: 100 },
      { subject: "Visual Attention", score: avg(allAttempts.filter((a) => a.visualAttention.available).map((a) => a.visualAttention.overallAttentionScore)), fullMark: 100 },
    ];
  }, [pastSessions]);

  // Category breakdown
  const categoryAnalysis = useMemo(() => {
    const scoresMap: Record<string, { total: number; count: number }> = {};
    pastSessions.forEach((s) => {
      s.questionAttempts.forEach((att) => {
        if (!scoresMap[att.category]) {
          scoresMap[att.category] = { total: 0, count: 0 };
        }
        scoresMap[att.category].total += att.overallScore;
        scoresMap[att.category].count += 1;
      });
    });

    const list = Object.keys(scoresMap).map((cat) => ({
      category: cat,
      average: Math.round(scoresMap[cat].total / scoresMap[cat].count),
      count: scoresMap[cat].count,
    }));

    const sorted = [...list].sort((a, b) => b.average - a.average);
    const strongest = sorted.slice(0, 3);
    const weakest = sorted.slice(-3).reverse();

    return { strongest, weakest, all: sorted };
  }, [pastSessions]);

  // Compare two sessions
  const compSessionA = pastSessions.find((s) => s.id === sessionCompareA);
  const compSessionB = pastSessions.find((s) => s.id === sessionCompareB);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Performance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive longitudinal assessment across all your Pre-CAS mock interviews.
          </p>
        </div>

        <Link href="/interview">
          <Button size="sm" className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs">
            Start New Practice Session
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Readiness Score</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {overallAvgScore > 0 ? `${overallAvgScore}%` : "—"}
            </p>
            <p className="text-[10px] text-slate-400">{completedSessions.length} sessions</p>
          </div>
          <ScoreGauge score={overallAvgScore} size="sm" showPercent={false} />
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Answer Quality</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {avgQuality > 0 ? `${avgQuality}%` : "—"}
            </p>
            <p className="text-[10px] text-slate-400">Content & relevance</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-brand-950 flex items-center justify-center text-brand-600">
            <Brain className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">English Fluency</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {avgFluency > 0 ? `${avgFluency}%` : "—"}
            </p>
            <p className="text-[10px] text-slate-400">Cadence & fillers</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
            <Mic className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Visual Attention</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {avgAttention > 0 ? `${avgAttention}%` : "—"}
            </p>
            <p className="text-[10px] text-slate-400">Gaze consistency</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600">
            <Eye className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Main Charts: Radar Competency + Score Progression Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Score Progression (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader>
              <div>
                <CardTitle className="text-sm">Score Progression Over Time</CardTitle>
                <CardDescription>Overall, Quality, and Fluency scores per session</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {trendData.length > 0 ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0d162d",
                          borderColor: "#1e293b",
                          borderRadius: "10px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                      <Line
                        type="monotone"
                        dataKey="overall"
                        name="Overall"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="quality"
                        name="Quality"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="fluency"
                        name="Fluency"
                        stroke="#38bdf8"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-navy-800 rounded-xl">
                  <BarChart3 className="w-10 h-10 text-slate-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    No Session Data Recorded
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Complete mock interviews to track your score progression.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Competencies Radar (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader>
              <div>
                <CardTitle className="text-sm">Interview Competencies Radar</CardTitle>
                <CardDescription>Multi-dimensional Pre-CAS readiness profile</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#334155" opacity={0.3} />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                    <PolarRadiusAxis domain={[0, 100]} stroke="#64748b" fontSize={9} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#818cf8"
                      fill="#6366f1"
                      fillOpacity={0.4}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0d162d",
                        borderColor: "#1e293b",
                        borderRadius: "10px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Speaking Pace & Filler Words Bar Chart */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-sm">Speaking Pace (WPM) & Filler Words Frequency</CardTitle>
            <CardDescription>Recent question attempts cadence and composure</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {attemptsMetricsData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attemptsMetricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d162d",
                      borderColor: "#1e293b",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="wpm" name="Speaking Pace (WPM)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fillers" name="Filler Word Count" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
              Practice questions to view speaking speed and filler word bar analytics.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Strongest vs Weakest Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <CardTitle className="text-sm">Strongest Pre-CAS Categories</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryAnalysis.strongest.length > 0 ? (
              categoryAnalysis.strongest.map((c) => {
                const info = CATEGORY_LABELS[c.category] || { label: c.category };
                return (
                  <div key={c.category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{info.label}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{c.average}%</span>
                    </div>
                    <ProgressBar value={c.average} showValue={false} size="sm" color="emerald" />
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No categories evaluated yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <CardTitle className="text-sm">Focus / Weakest Categories</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryAnalysis.weakest.length > 0 ? (
              categoryAnalysis.weakest.map((c) => {
                const info = CATEGORY_LABELS[c.category] || { label: c.category };
                return (
                  <div key={c.category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{info.label}</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{c.average}%</span>
                    </div>
                    <ProgressBar value={c.average} showValue={false} size="sm" color="amber" />
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No focus areas identified yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Session Comparator */}
      {completedSessions.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Side-by-Side Session Comparison</CardTitle>
            <CardDescription>Select two past sessions to compare metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <select
                value={sessionCompareA}
                onChange={(e) => setSessionCompareA(e.target.value)}
                className="p-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700"
              >
                <option value="">Select Session A</option>
                {completedSessions.map((s, idx) => (
                  <option key={s.id} value={s.id}>
                    Session #{idx + 1} ({new Date(s.startedAt).toLocaleDateString()}) - {s.overallScore}%
                  </option>
                ))}
              </select>

              <select
                value={sessionCompareB}
                onChange={(e) => setSessionCompareB(e.target.value)}
                className="p-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700"
              >
                <option value="">Select Session B</option>
                {completedSessions.map((s, idx) => (
                  <option key={s.id} value={s.id}>
                    Session #{idx + 1} ({new Date(s.startedAt).toLocaleDateString()}) - {s.overallScore}%
                  </option>
                ))}
              </select>
            </div>

            {compSessionA && compSessionB && (
              <div className="grid grid-cols-3 gap-2 text-xs p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700 text-center">
                <div className="font-semibold text-slate-500">Metric</div>
                <div className="font-bold text-indigo-600">Session A</div>
                <div className="font-bold text-purple-600">Session B</div>

                <div className="text-slate-600 dark:text-slate-400 py-1">Overall Score</div>
                <div className="font-bold">{compSessionA.overallScore}%</div>
                <div className="font-bold">{compSessionB.overallScore}%</div>

                <div className="text-slate-600 dark:text-slate-400 py-1">Answer Quality</div>
                <div className="font-bold">{compSessionA.averageQualityScore}%</div>
                <div className="font-bold">{compSessionB.averageQualityScore}%</div>

                <div className="text-slate-600 dark:text-slate-400 py-1">English Fluency</div>
                <div className="font-bold">{compSessionA.averageFluencyScore}%</div>
                <div className="font-bold">{compSessionB.averageFluencyScore}%</div>

                <div className="text-slate-600 dark:text-slate-400 py-1">Visual Attention</div>
                <div className="font-bold">{compSessionA.averageAttentionScore}%</div>
                <div className="font-bold">{compSessionB.averageAttentionScore}%</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
