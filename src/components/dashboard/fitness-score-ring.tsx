"use client";

import { motion } from "framer-motion";
import type { FitnessScoreBreakdown } from "@/lib/analysis";
import { cn } from "@/lib/utils";

const GRADE_COLORS: Record<FitnessScoreBreakdown["grade"], string> = {
  A: "text-emerald-400",
  B: "text-sky-400",
  C: "text-amber-400",
  D: "text-orange-400",
  F: "text-primary",
};

interface FitnessScoreRingProps {
  score: FitnessScoreBreakdown;
}

export function FitnessScoreRing({ score }: FitnessScoreRingProps) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score.total / 100) * circumference;

  return (
    <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth="10"
        />
        <motion.circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute flex flex-col items-center text-center">
        <motion.span
          className="text-4xl font-bold tabular-nums"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {score.total}
        </motion.span>
        <span
          className={cn(
            "text-lg font-semibold",
            GRADE_COLORS[score.grade]
          )}
        >
          {score.grade}
        </span>
        <span className="text-xs text-muted-foreground">{score.labelUk}</span>
      </div>
    </div>
  );
}
