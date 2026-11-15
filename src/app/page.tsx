"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play,
  Sparkles,
  BarChart2,
  BookOpen,
  ShieldCheck,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Brain,
  Video,
  Mic,
  Eye,
  Calendar,
  Layers,
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CATEGORY_LABELS } from "@/constants/default-questions";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const { profile, pastSessions, questions, startInterview } = useAppStore();

  const completedSessions = useMemo(
    () => pastSessions.filter((s) => s.status === "completed"),
    [pastSessions]
  );

  // Compute live statistics from actual stored data
  const totalSessionsCount = pastSessions.length;
  const totalCompletedQuestions = pastSessions.reduce(
    (sum, s) => sum + (s.completedQuestions || 0),
    0
  );

  const avgReadiness =
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

  // Chart data from real past sessions (chronological order)
  const chartData = useMemo(() => {
    return [...completedSessions]
      .reverse()
      .map((s, idx) => ({
        name: `Session ${idx + 1}`,
        score: s.overallScore,
        quality: s.averageQualityScore,
        fluency: s.averageFluencyScore,
        date: new Date(s.startedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      }));
  }, [completedSessions]);

  // Compute weakest assessment categories from actual attempt data
  const categoryAverages = useMemo(() => {
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

    return Object.keys(scoresMap).map((cat) => ({
      category: cat,
      average: Math.round(scoresMap[cat].total / scoresMap[cat].count),
      count: scoresMap[cat].count,
    })).sort((a, b) => a.average - b.average);
  }, [pastSessions]);

  // Recommended next question: unpracticed or lowest scoring question
  const recommendedQuestion = useMemo(() => {
    const unpracticed = questions.filter((q) => !q.timesPracticed || q.timesPracticed === 0);
    if (unpracticed.length > 0) return unpracticed[0];
    return questions[0];
  }, [questions]);

  const handleStartMode = (mode: "mode-16" | "mode-20") => {
    startInterview(mode);
    router.push("/interview");
  };

  const handleStartRandom = () => {
    const randomIdx = Math.floor(Math.random() * questions.length);
    const chosen = questions[randomIdx];
    startInterview("custom", [chosen.id]);
    router.push("/interview");
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-brand-900 to-indigo-900 border border-brand-500/20 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-brand-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-brand-300" />
              <span>UK University Pre-CAS Preparation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {profile.fullName || "Student"}!
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Preparing for {profile.intendedProgramme || "MSc Programme"} at{" "}
              <span className="font-semibold text-white">
                {profile.intendedUniversity || "Target UK University"}
              </span>
              . Measure your answer relevance, spoken English fluency, and visual attention with real in-browser analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={() => handleStartMode("mode-16")}
              className="bg-brand-500 hover:bg-brand-400 text-white font-bold shadow-lg shadow-brand-500/30 px-6"
            >
              <Play className="w-4 h-4 mr-2 fill-current" />
              Start Mock Interview
            </Button>
            <Link href="/system-check">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Test Hardware
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative background grid pattern */}
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Readiness Scorecard */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Pre-CAS Readiness
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {avgReadiness > 0 ? avgReadiness : "—"}
                </span>
                {avgReadiness > 0 && <span className="text-xs text-slate-400">/ 100</span>}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {avgReadiness >= 75
                  ? "✓ Highly competitive"
                  : avgReadiness > 0
                  ? "Practice recommended"
                  : "No completed sessions"}
              </p>
            </div>
            <ScoreGauge score={avgReadiness} size="sm" showPercent={false} />
          </CardContent>
        </Card>

        {/* English Fluency Score */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                English Fluency
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {avgFluency > 0 ? avgFluency : "—"}
                </span>
                {avgFluency > 0 && <span className="text-xs text-slate-400">/ 100</span>}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Pacing, fillers & continuity
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Mic className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Answer Quality Score */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Answer Quality
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {avgQuality > 0 ? avgQuality : "—"}
                </span>
                {avgQuality > 0 && <span className="text-xs text-slate-400">/ 100</span>}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Relevance & key points
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Brain className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Visual Attention Score */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Visual Attention
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {avgAttention > 0 ? avgAttention : "—"}
                </span>
                {avgAttention > 0 && <span className="text-xs text-slate-400">/ 100</span>}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Screen-facing consistency
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Eye className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => handleStartMode("mode-16")}
          className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-brand-500 dark:hover:border-brand-500 transition-all text-left group shadow-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform mb-2">
            <Play className="w-4 h-4 fill-current" />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Practice 16 Qs</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Focused interview drill</p>
        </button>

        <button
          onClick={() => handleStartMode("mode-20")}
          className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all text-left group shadow-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform mb-2">
            <Layers className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Full 20 Qs</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Complete simulation</p>
        </button>

        <button
          onClick={handleStartRandom}
          className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all text-left group shadow-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform mb-2">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Random Question</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Rapid single drill</p>
        </button>

        <Link
          href="/system-check"
          className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all text-left group shadow-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform mb-2">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Hardware Test</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Cam & mic readiness</p>
        </Link>
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Performance Improvement Chart */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Performance Improvement Trend</CardTitle>
                <CardDescription>
                  Overall readiness and category trends over time
                </CardDescription>
              </div>
              <Badge variant="indigo">
                {totalSessionsCount} Total Sessions
              </Badge>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0d162d",
                          borderColor: "#1e293b",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        fill="url(#scoreGrad)"
                        name="Overall Score"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-navy-800 rounded-xl">
                  <BarChart2 className="w-10 h-10 text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No Practice Sessions Yet
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                    Complete your first Pre-CAS mock interview to populate your local progress chart and performance metrics.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleStartMode("mode-16")}
                    className="mt-4 bg-brand-600 hover:bg-brand-700 text-white"
                  >
                    Start 16-Question Practice
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Practice Activity */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Recent Practice Activity</CardTitle>
                <CardDescription>Latest simulated Pre-CAS sessions</CardDescription>
              </div>
              <Link href="/history">
                <Button variant="ghost" size="sm" className="text-xs">
                  View All History <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {pastSessions.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-navy-800">
                  {pastSessions.slice(0, 4).map((session) => (
                    <div
                      key={session.id}
                      className="py-3 flex items-center justify-between first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center text-brand-600 dark:text-brand-400">
                          <Video className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white capitalize">
                            {session.mode === "mode-16"
                              ? "16-Question Mock"
                              : session.mode === "mode-20"
                              ? "20-Question Full Simulation"
                              : "Custom Practice"}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {new Date(session.startedAt).toLocaleDateString()} •{" "}
                            {session.completedQuestions} of {session.totalQuestions} questions completed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            session.overallScore >= 75
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                              : session.overallScore >= 60
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                              : "bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {session.overallScore > 0 ? `${session.overallScore}%` : "Incomplete"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                  No sessions recorded yet. Start practicing to track your activity.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Weakest Categories & Next Recommendation */}
        <div className="space-y-6">
          {/* Recommended Next Practice */}
          <Card variant="highlight">
            <CardHeader>
              <div>
                <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                  Recommended Practice
                </span>
                <CardTitle className="text-sm mt-0.5">
                  Question #{recommendedQuestion.number}
                </CardTitle>
              </div>
              <Badge variant="purple">{recommendedQuestion.difficulty}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                "{recommendedQuestion.title}"
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {CATEGORY_LABELS[recommendedQuestion.category]?.label || recommendedQuestion.category}
              </p>
              <div className="pt-2 border-t border-slate-200/60 dark:border-navy-700/60">
                <Button
                  size="sm"
                  onClick={() => {
                    startInterview("custom", [recommendedQuestion.id]);
                    router.push("/interview");
                  }}
                  className="w-full text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white"
                >
                  <Play className="w-3.5 h-3.5 mr-1 fill-current" /> Practice This Question
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Breakdown / Weakest Categories */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-sm">Category Performance</CardTitle>
                <CardDescription>Scores across Pre-CAS areas</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {categoryAverages.length > 0 ? (
                categoryAverages.map((item) => {
                  const catInfo = CATEGORY_LABELS[item.category] || { label: item.category };
                  return (
                    <div key={item.category} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[170px]">
                          {catInfo.label}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.average}%
                        </span>
                      </div>
                      <ProgressBar
                        value={item.average}
                        showValue={false}
                        size="sm"
                        color={item.average >= 75 ? "emerald" : item.average >= 60 ? "amber" : "rose"}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
                  <p>Category breakdowns will automatically populate once you complete mock questions.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Practice Goals Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pre-CAS Readiness Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex items-start gap-2.5 text-xs">
                <CheckCircle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    totalCompletedQuestions >= 16 ? "text-emerald-500" : "text-slate-400"
                  }`}
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Complete at least 16 practice questions ({Math.min(16, totalCompletedQuestions)}/16)
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-xs">
                <CheckCircle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    avgFluency >= 75 ? "text-emerald-500" : "text-slate-400"
                  }`}
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Achieve &gt;75% English fluency rating
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-xs">
                <CheckCircle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    profile.intendedUniversity && profile.sponsorName ? "text-emerald-500" : "text-slate-400"
                  }`}
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Complete personalized student profile
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
