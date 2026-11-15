import React from "react";
import { clsx } from "clsx";

interface ScoreGaugeProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  label?: string;
  sublabel?: string;
  showPercent?: boolean;
}

export function ScoreGauge({
  score,
  size = "md",
  label,
  sublabel,
  showPercent = true,
}: ScoreGaugeProps) {
  const safeScore = Math.max(0, Math.min(100, isNaN(score) ? 0 : Math.round(score)));

  // Determine stroke color
  let strokeColor = "#10b981"; // emerald
  let textColor = "text-emerald-600 dark:text-emerald-400";
  if (safeScore < 60) {
    strokeColor = "#f43f5e"; // rose
    textColor = "text-rose-600 dark:text-rose-400";
  } else if (safeScore < 75) {
    strokeColor = "#f59e0b"; // amber
    textColor = "text-amber-600 dark:text-amber-400";
  } else if (safeScore < 85) {
    strokeColor = "#6366f1"; // indigo
    textColor = "text-indigo-600 dark:text-indigo-400";
  }

  const dimensions = {
    sm: { radius: 28, stroke: 5, width: 70, height: 70, textSize: "text-lg font-bold" },
    md: { radius: 42, stroke: 7, width: 104, height: 104, textSize: "text-2xl font-bold" },
    lg: { radius: 64, stroke: 9, width: 150, height: 150, textSize: "text-4xl font-extrabold" },
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width={dimensions.width} height={dimensions.height} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.height / 2}
            r={dimensions.radius}
            stroke="currentColor"
            strokeWidth={dimensions.stroke}
            fill="transparent"
            className="text-slate-100 dark:text-navy-800"
          />
          {/* Progress circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.height / 2}
            r={dimensions.radius}
            stroke={strokeColor}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={clsx(dimensions.textSize, textColor, "leading-none")}>
            {safeScore}
            {showPercent && <span className="text-xs font-medium ml-0.5 opacity-80">/100</span>}
          </span>
        </div>
      </div>
      {label && <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">{label}</span>}
      {sublabel && <span className="text-[11px] text-slate-500 dark:text-slate-400">{sublabel}</span>}
    </div>
  );
}

