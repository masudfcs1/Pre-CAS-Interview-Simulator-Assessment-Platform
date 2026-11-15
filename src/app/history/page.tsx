"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  History,
  Trash2,
  Download,
  Printer,
  Calendar,
  Clock,
  Eye,
  CheckCircle2,
  Video,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  Play,
  FileText,
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { InterviewSession, QuestionAttemptScorecard } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { exportAllDataAsJSON, clearAllIndexedDBData } from "@/services/storage/indexed-db";

export default function HistoryPage() {
  const { pastSessions, deleteSession, loadPastSessions } = useAppStore();
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "completed">("all");

  const filteredSessions = pastSessions.filter((s) =>
    activeTab === "all" ? true : s.status === "completed"
  );

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this interview session? This cannot be undone.")) {
      await deleteSession(id);
      if (selectedSession?.id === id) {
        setSelectedSession(null);
      }
    }
  };

  const handleExportJSON = async () => {
    try {
      const json = await exportAllDataAsJSON();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `casready-interview-history-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleClearAll = async () => {
    if (confirm("DANGER: Are you sure you want to clear ALL practice history and session records?")) {
      await clearAllIndexedDBData();
      await loadPastSessions();
      setSelectedSession(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Practice History & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review detailed transcripts, visual attention tracking, and scores for every mock interview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportJSON} className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export JSON
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrintReport} className="text-xs">
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / Save PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="text-xs text-rose-600 hover:text-rose-700 hover:border-rose-300"
          >
            Clear History
          </Button>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === "all"
              ? "bg-brand-600 text-white"
              : "bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          All Sessions ({pastSessions.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === "completed"
              ? "bg-brand-600 text-white"
              : "bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          Completed Only ({pastSessions.filter((s) => s.status === "completed").length})
        </button>
      </div>

      {/* Sessions List */}
      {filteredSessions.length > 0 ? (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <Card
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className="p-4 hover:border-brand-500/50 cursor-pointer transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/80 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white capitalize">
                        {session.mode === "mode-16"
                          ? "16-Question Mock Interview"
                          : session.mode === "mode-20"
                          ? "20-Question Full Simulation"
                          : "Custom Practice Drill"}
                      </h3>
                      <Badge
                        variant={
                          session.status === "completed"
                            ? "success"
                            : session.status === "abandoned"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {session.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(session.startedAt).toLocaleString()}
                      </span>
                      <span>•</span>
                      <span>
                        {session.completedQuestions} of {session.totalQuestions} questions completed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span
                      className={`text-base font-extrabold px-3 py-1 rounded-full ${
                        session.overallScore >= 75
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                          : session.overallScore >= 60
                          ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                          : "bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {session.overallScore > 0 ? `${session.overallScore}%` : "Incomplete"}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">Readiness</p>
                  </div>

                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center p-12">
          <History className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No Practice Sessions Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Complete your first mock interview to view scorecards, transcripts, and fluency feedback here.
          </p>
          <Link href="/interview">
            <Button size="sm" className="mt-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs">
              <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
              Launch Mock Interview
            </Button>
          </Link>
        </Card>
      )}

      {/* Detailed Session Scorecard Modal */}
      {selectedSession && (
        <Modal
          isOpen={!!selectedSession}
          onClose={() => setSelectedSession(null)}
          title="Interview Session Details"
          description={`Conducted on ${new Date(selectedSession.startedAt).toLocaleString()}`}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            {/* Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Overall Score</span>
                <p className="text-xl font-extrabold text-brand-600 dark:text-brand-400 mt-0.5">
                  {selectedSession.overallScore}%
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Quality Avg</span>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {selectedSession.averageQualityScore}%
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Fluency Avg</span>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {selectedSession.averageFluencyScore}%
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Attention Avg</span>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {selectedSession.averageAttentionScore}%
                </p>
              </div>
            </div>

            {/* Questions Attempted List */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Question Attempts ({selectedSession.questionAttempts.length})
              </h4>

              <div className="divide-y divide-slate-100 dark:divide-navy-800">
                {selectedSession.questionAttempts.map((att, idx) => (
                  <div key={att.id} className="py-4 space-y-2 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-brand-600">Q#{idx + 1}</span>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                            {att.questionTitle}
                          </h5>
                        </div>
                        <p className="text-xs text-slate-500 italic mt-0.5">
                          "{att.keyTakeaway}"
                        </p>
                      </div>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white shrink-0">
                        {att.overallScore}%
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-navy-800 text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 block mb-0.5">
                        Transcript ({att.fluency.wordCount} words • ~{att.fluency.speakingPaceWpm} WPM • {att.fluency.fillerWordCount} fillers):
                      </span>
                      "{att.transcript}"
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-navy-800">
              <Button size="sm" onClick={() => setSelectedSession(null)} className="text-xs">
                Close Scorecard
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
