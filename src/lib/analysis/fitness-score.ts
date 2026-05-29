import type { ActivityLevel, Goal } from "@prisma/client";
import { scoreActivity } from "./bmr";
import { scoreBmiHealth } from "./bmi";
import type {
  FitnessScoreBreakdown,
  ProportionComparison,
} from "./types";

function scoreProportions(proportions: ProportionComparison[]): number {
  if (proportions.length === 0) return 65;

  const scores = proportions.map((p) => {
    if (p.status === "ON_TARGET") return 100;
    if (p.status === "ABOVE") return Math.max(70, 100 - Math.abs(p.deviationPercent));
    return Math.max(20, 100 + p.deviationPercent * 2);
  });

  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function scoreGoalAlignment(
  currentKg: number,
  targetKg: number,
  goal: Goal
): number {
  const diff = Math.abs(currentKg - targetKg);
  const pct = diff / Math.max(currentKg, 1);

  if (goal === "MAINTAIN") {
    return pct < 0.03 ? 95 : Math.round(90 - pct * 100);
  }

  if (goal === "LOSS") {
    if (currentKg <= targetKg) return 100;
    return Math.round(Math.max(40, 100 - pct * 120));
  }

  if (currentKg >= targetKg) return 100;
  return Math.round(Math.max(40, 100 - pct * 120));
}

function toGrade(total: number): FitnessScoreBreakdown["grade"] {
  if (total >= 85) return "A";
  if (total >= 72) return "B";
  if (total >= 58) return "C";
  if (total >= 45) return "D";
  return "F";
}

const GRADE_LABELS: Record<FitnessScoreBreakdown["grade"], string> = {
  A: "Відмінно",
  B: "Добре",
  C: "Задовільно",
  D: "Потребує уваги",
  F: "Критично низько",
};

export function calculateFitnessScore(
  bmi: number,
  proportions: ProportionComparison[],
  currentKg: number,
  targetKg: number,
  goal: Goal,
  activityLevel: ActivityLevel
): FitnessScoreBreakdown {
  const bmiScore = scoreBmiHealth(bmi);
  const proportionScore = scoreProportions(proportions);
  const goalScore = scoreGoalAlignment(currentKg, targetKg, goal);
  const activityScore = scoreActivity(activityLevel);

  const total = Math.round(
    bmiScore * 0.25 +
      proportionScore * 0.35 +
      goalScore * 0.2 +
      activityScore * 0.2
  );

  const grade = toGrade(total);

  return {
    total: Math.min(100, Math.max(0, total)),
    bmiScore,
    proportionScore,
    goalScore,
    activityScore,
    grade,
    labelUk: GRADE_LABELS[grade],
  };
}
