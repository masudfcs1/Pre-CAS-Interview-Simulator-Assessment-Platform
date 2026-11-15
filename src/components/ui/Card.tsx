import React from "react";
import { clsx } from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient" | "highlight";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  const base = "rounded-2xl border transition-all duration-200";
  const variants = {
    default: "bg-white dark:bg-navy-900/80 border-slate-200 dark:border-navy-700/60 shadow-sm",
    glass: "bg-white/80 dark:bg-navy-900/60 backdrop-blur-md border-slate-200/80 dark:border-navy-700/50 shadow-md",
    gradient: "bg-gradient-to-br from-white to-slate-50 dark:from-navy-900 dark:to-navy-850 border-slate-200 dark:border-navy-700/60 shadow-sm",
    highlight: "bg-gradient-to-br from-indigo-50/70 to-purple-50/40 dark:from-brand-950/40 dark:to-purple-950/20 border-brand-200/60 dark:border-brand-800/40 shadow-sm",
  };

  return (
    <div className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("p-5 pb-3 flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={clsx("text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={clsx("text-xs text-slate-500 dark:text-slate-400 mt-0.5", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("p-5 pt-2", className)} {...props}>
      {children}
    </div>
  );
}
