import { calculateBMI } from "./bmi";
import { calculateBmrResult } from "./bmr";
import {
  compareProportions,
  resolveMcCallum,
} from "./mccallum";
import { calculateFitnessScore } from "./fitness-score";
import { identifyWeakZones, inferGeneralWeakZones } from "./weak-zones";
import type { AnalysisInput, BodyAnalysisResult } from "./types";

export * from "./types";
export * from "./bmi";
export * from "./bmr";
export * from "./mccallum";
export * from "./fitness-score";
export * from "./weak-zones";

export function runBodyAnalysis(input: AnalysisInput): BodyAnalysisResult {
  const bmi = calculateBMI(input.weightKg, input.heightCm);
  const bmr = calculateBmrResult(
    input.weightKg,
    input.heightCm,
    input.age,
    input.gender,
    input.activityLevel
  );

  const mccallum = resolveMcCallum(
    input.heightCm,
    input.gender,
    input.measurements
  );

  const proportions = compareProportions(
    mccallum.idealsCm,
    input.measurements
  );

  let weakZones = identifyWeakZones(proportions);

  if (weakZones.length === 0 && proportions.length === 0) {
    weakZones = inferGeneralWeakZones({
      goal: input.goal,
      bmiCategory: bmi.category,
      activityLevel: input.activityLevel,
    });
  }

  const fitnessScore = calculateFitnessScore(
    bmi.value,
    proportions,
    input.weightKg,
    input.targetWeightKg,
    input.goal,
    input.activityLevel
  );

  const insights = buildInsights(input, bmi, bmr, mccallum, fitnessScore, weakZones);

  return {
    bmi,
    bmr,
    mccallum,
    proportions,
    weakZones,
    fitnessScore,
    insights,
  };
}

function buildInsights(
  input: AnalysisInput,
  bmi: ReturnType<typeof calculateBMI>,
  bmr: ReturnType<typeof calculateBmrResult>,
  mccallum: ReturnType<typeof resolveMcCallum>,
  fitnessScore: ReturnType<typeof calculateFitnessScore>,
  weakZones: ReturnType<typeof identifyWeakZones>
): string[] {
  const lines: string[] = [];

  lines.push(
    `Ваш BMI ${bmi.value} — ${bmi.labelUk.toLowerCase()}. Базовий метаболізм ~${bmr.bmr} ккал, підтримка ~${bmr.tdee} ккал.`
  );

  if (mccallum.wristEstimated) {
    lines.push(
      "Ідеальні пропорції McCallum розраховані за орієнтовним обхватом зап'ястя — додайте заміри для точності."
    );
  }

  const weightDiff = input.weightKg - input.targetWeightKg;
  if (input.goal === "LOSS" && weightDiff > 0) {
    lines.push(`До цілі залишилось ~${Math.round(weightDiff * 10) / 10} кг.`);
  } else if (input.goal === "GAIN" && weightDiff < 0) {
    lines.push(
      `До цілі набору ~${Math.round(Math.abs(weightDiff) * 10) / 10} кг.`
    );
  }

  if (weakZones.length > 0) {
    lines.push(
      `Виявлено ${weakZones.length} зон(и) для пріоритету в тренуваннях.`
    );
  }

  lines.push(`Загальний Fitness Score: ${fitnessScore.total}/100 (${fitnessScore.labelUk}).`);

  return lines;
}
