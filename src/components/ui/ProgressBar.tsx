import React from "react";
import { clsx } from "clsx";

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showValue?: boolean;
  color?: "indigo" | "emerald" | "amber" | "rose" | "purple";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressBar({
  value,
  label,
  showValue = true,
  color = "indigo",
  size = "md",
  className,
}: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, isNaN(value) ? 0 : Math.round(value)));

  const colorClasses = {
    indigo: "bg-indigo-600 dark:bg-brand-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    purple: "bg-purple-600",
  }[color];

  const heightClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3.5",
  }[size];

  return (
    <div className={clsx("w-full", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium text-slate-700 dark:text-slate-300">
          {label && <span>{label}</span>}
          {showValue && <span className="text-slate-500 dark:text-slate-400">{safeValue}%</span>}
        </div>
      )}
      <div className={clsx("w-full bg-slate-100 dark:bg-navy-800 rounded-full overflow-hidden", heightClasses)}>
        <div
          className={clsx("h-full rounded-full transition-all duration-500 ease-out", colorClasses)}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
