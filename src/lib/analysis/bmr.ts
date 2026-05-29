import type { ActivityLevel, Gender } from "@prisma/client";
import type { BmrResult } from "./types";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  ACTIVE: 1.725,
  VERY_ACTIVE: 1.9,
};

/** Mifflin–St Jeor (ккал/день) */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === "MALE") return Math.round(base + 5);
  if (gender === "FEMALE") return Math.round(base - 161);
  return Math.round(base - 78);
}

export function calculateTDEE(
  bmr: number,
  activityLevel: ActivityLevel
): number {
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55));
}

export function calculateBmrResult(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel
): BmrResult {
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  return {
    bmr,
    tdee: calculateTDEE(bmr, activityLevel),
    formula: "mifflin-st-jeor",
  };
}

export function scoreActivity(activityLevel: ActivityLevel): number {
  const map: Record<ActivityLevel, number> = {
    SEDENTARY: 40,
    LIGHT: 55,
    MODERATE: 72,
    ACTIVE: 88,
    VERY_ACTIVE: 100,
  };
  return map[activityLevel] ?? 70;
}
