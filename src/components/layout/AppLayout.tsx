"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  BookOpen,
  Video,
  BarChart3,
  History,
  ShieldCheck,
  CheckCircle2,
  UserCircle,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  Play,
  GraduationCap,
  Sparkles,
  Camera,
  Mic,
  Activity,
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/Button";

interface AppLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/interview", label: "Mock Interview", icon: Video, badge: "Live" },
  { href: "/questions", label: "Question Bank", icon: BookOpen },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/history", label: "Practice History", icon: History },
  { href: "/system-check", label: "System Readiness", icon: ShieldCheck },
  { href: "/profile", label: "Student Profile", icon: UserCircle },
  { href: "/qa", label: "Verification & QA", icon: CheckCircle2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, settings, updateSettings, pastSessions, startInterview } = useAppStore();

  // Load past sessions on layout mount
  useEffect(() => {
    useAppStore.getState().loadPastSessions();
  }, []);

  // Compute overall average readiness score from real data
  const completedSessions = pastSessions.filter((s) => s.status === "completed");
  const overallScore =
    completedSessions.length > 0
      ? Math.round(completedSessions.reduce((sum, s) => sum + s.overallScore, 0) / completedSessions.length)
      : 0;

  const toggleTheme = () => {
    const nextTheme = settings.theme === "dark" ? "light" : "dark";
    updateSettings({ theme: nextTheme });
  };

  const handleQuickStart = () => {
    startInterview("mode-16");
    router.push("/interview");
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-slate-200 dark:border-navy-800/80 bg-white/90 dark:bg-navy-900/90 backdrop-blur-xl shrink-0 z-30">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                  CAS<span className="text-brand-500 dark:text-brand-400">Ready</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300">
                  UK
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Pre-CAS Assessment</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30 dark:bg-brand-600"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800/60"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={clsx(
                      "w-4 h-4 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={clsx(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 animate-pulse"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Readiness Card in Sidebar */}
        <div className="p-4 m-3 rounded-xl bg-slate-50 dark:bg-navy-850/60 border border-slate-200/80 dark:border-navy-700/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Readiness Score
            </span>
            <span
              className={clsx(
                "text-xs font-bold px-2 py-0.5 rounded-full",
                overallScore >= 75
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                  : overallScore > 0
                  ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                  : "bg-slate-200 dark:bg-navy-700 text-slate-700 dark:text-slate-300"
              )}
            >
              {overallScore > 0 ? `${overallScore}/100` : "No sessions"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
            {completedSessions.length === 0
              ? "Complete a mock interview to calculate your Pre-CAS readiness."
              : `${completedSessions.length} sessions evaluated.`}
          </p>
          <Button
            size="sm"
            onClick={handleQuickStart}
            className="w-full text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white"
          >
            <Play className="w-3.5 h-3.5 mr-1 fill-current" /> Practice 16 Qs
          </Button>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-navy-700 flex items-center justify-center font-bold text-xs text-brand-600 dark:text-brand-400 shrink-0">
              {profile.fullName.charAt(0) || "S"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {profile.fullName || "Student"}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate">
                {profile.intendedUniversity || "UK University"}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-navy-800 transition-colors"
            title="Toggle theme"
          >
            {settings.theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 h-16 border-b border-slate-200 dark:border-navy-800 bg-white/80 dark:bg-navy-900/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">CASReady</span>
              <span>/</span>
              <span className="capitalize">
                {NAV_ITEMS.find((item) =>
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                )?.label || "Dashboard"}
              </span>
            </div>
          </div>

          {/* Right Header CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* System Status Indicators */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-navy-800 text-xs text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-emerald-500" />
                <span>Webcam</span>
              </span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="flex items-center gap-1">
                <Mic className="w-3.5 h-3.5 text-emerald-500" />
                <span>Microphone</span>
              </span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-brand-500" />
                <span>Local AI</span>
              </span>
            </div>

            {/* Quick Start Mock Interview Action */}
            <Button
              size="sm"
              onClick={handleQuickStart}
              className="bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-sm shadow-brand-500/20"
            >
              <Play className="w-3.5 h-3.5 mr-1 fill-current" />
              <span>Start Mock Interview</span>
            </Button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm">
            <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-navy-900 p-5 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-navy-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg">CASReady</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="mt-4 space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={clsx(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                          isActive
                            ? "bg-brand-600 text-white"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Theme</span>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-navy-800"
                >
                  {settings.theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
