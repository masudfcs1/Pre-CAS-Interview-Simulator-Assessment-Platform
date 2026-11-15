import React from "react";
import { clsx } from "clsx";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "purple" | "indigo" | "outline";
  size?: "sm" | "md";
}

export function Badge({ className, variant = "default", size = "sm", children, ...props }: BadgeProps) {
  const base = "inline-flex items-center font-medium rounded-full";

  const variants = {
    default: "bg-slate-100 text-slate-800 dark:bg-navy-800 dark:text-slate-300",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40",
    danger: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/40",
    purple: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40",
    indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40",
    outline: "border border-slate-300 dark:border-navy-700 text-slate-600 dark:text-slate-400",
  };

  const sizes = {
    sm: "px-2.5 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-xs gap-1.5",
  };

  return (
    <span className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}

