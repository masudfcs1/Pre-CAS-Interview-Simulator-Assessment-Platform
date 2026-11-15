"use client";

import React, { useState } from "react";
import {
  Settings,
  Sliders,
  Camera,
  Mic,
  Volume2,
  Moon,
  Sun,
  RotateCcw,
  Save,
  CheckCircle2,
  Download,
  Trash2,
  Shield,
  HelpCircle,
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { exportAllDataAsJSON, clearAllIndexedDBData } from "@/services/storage/indexed-db";

export default function SettingsPage() {
  const { settings, updateSettings, resetQuestions } = useAppStore();
  const [formSettings, setFormSettings] = useState(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleWeightChange = (key: "quality" | "fluency" | "attention", val: number) => {
    const updated = {
      ...formSettings.rubricWeights,
      [key]: Math.max(0, Math.min(100, val)),
    };
    setFormSettings((prev) => ({ ...prev, rubricWeights: updated }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const weightsSum =
    formSettings.rubricWeights.quality +
    formSettings.rubricWeights.fluency +
    formSettings.rubricWeights.attention;

  const handleExportAll = async () => {
    try {
      const json = await exportAllDataAsJSON();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `casready-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const handleResetAll = async () => {
    if (confirm("Reset all settings, custom questions, and interview history to factory defaults?")) {
      await clearAllIndexedDBData();
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Platform Settings & Rubric Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Customize assessment weights, hardware defaults, text-to-speech preferences, and data privacy.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4" /> Settings Saved
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Rubric Weights */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-500" />
              <CardTitle className="text-sm">Pre-CAS Scorecard Rubric Weights</CardTitle>
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                weightsSum === 100
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
              }`}
            >
              Total: {weightsSum}% {weightsSum !== 100 ? "(Must sum to 100%)" : "✓ Balanced"}
            </span>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Answer Quality & Relevance Weight</span>
                  <span>{formSettings.rubricWeights.quality}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  value={formSettings.rubricWeights.quality}
                  onChange={(e) => handleWeightChange("quality", Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>English Speaking Fluency Weight</span>
                  <span>{formSettings.rubricWeights.fluency}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  value={formSettings.rubricWeights.fluency}
                  onChange={(e) => handleWeightChange("fluency", Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Visual Attention & Eye Gaze Weight</span>
                  <span>{formSettings.rubricWeights.attention}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={formSettings.rubricWeights.attention}
                  onChange={(e) => handleWeightChange("attention", Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hardware & Interview Defaults */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-500" />
              <CardTitle className="text-sm">Interview Hardware & Speech Defaults</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Enable Camera by Default
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Runs MediaPipe landmark gaze tracking
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formSettings.cameraEnabled}
                  onChange={(e) =>
                    setFormSettings((prev) => ({ ...prev, cameraEnabled: e.target.checked }))
                  }
                  className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Enable Microphone by Default
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Captures audio & speech features
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formSettings.micEnabled}
                  onChange={(e) =>
                    setFormSettings((prev) => ({ ...prev, micEnabled: e.target.checked }))
                  }
                  className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Interviewer Text-to-Speech (TTS)
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={formSettings.ttsEnabled}
                      onChange={(e) =>
                        setFormSettings((prev) => ({ ...prev, ttsEnabled: e.target.checked }))
                      }
                      className="rounded text-brand-600"
                    />
                    Read question aloud automatically
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  TTS Voice Reading Rate: {formSettings.ttsRate}x
                </label>
                <input
                  type="range"
                  min="0.75"
                  max="1.25"
                  step="0.05"
                  value={formSettings.ttsRate}
                  onChange={(e) =>
                    setFormSettings((prev) => ({ ...prev, ttsRate: Number(e.target.value) }))
                  }
                  className="w-full accent-brand-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-500" />
              <CardTitle className="text-sm">Privacy, Security & Data Management</CardTitle>
            </div>
            <CardDescription>100% in-browser offline architecture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              CASReady does not transmit any video frames, audio recordings, or personal answers to any remote cloud or AI API server. All models execute locally in your browser sandbox using Web Audio API and MediaPipe.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={handleExportAll} className="text-xs">
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export Full Backup (JSON)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetAll}
                className="text-xs text-rose-600 hover:text-rose-700 hover:border-rose-300"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Factory Reset All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save CTA */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            size="lg"
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-6"
          >
            <Save className="w-4 h-4 mr-1.5" />
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}

