import type {
  MeasurementKey,
  ProportionComparison,
  WeakZone,
} from "./types";
import { MEASUREMENT_LABELS } from "./mccallum";

const RECOMMENDATIONS: Record<MeasurementKey, string> = {
  chest: "Додайте жим лежачи, віджимання та розведення — 2× на тиждень.",
  hips: "Присідання, випади та hip thrust для силової бази ніг.",
  waist: "Контроль харчування + планка та вакуум для талії.",
  thigh: "Присідання, жим ногами та випади з прогресією навантаження.",
  neck: "Шраги та ізольовані вправи на трапецію (помірно).",
  bicep: "Підйоми на біцепс (штанга/гантелі) 8–12 повторень.",
  forearm: "Згинання зап'ясть, фермерська прогулянка, підтягування.",
  calf: "Підйоми на носки стоячи/сидячи 3× на тиждень.",
};

/** Поріг відхилення від ідеалу McCallum для «слабкої зони» */
const WEAK_ZONE_THRESHOLD = -5;

export function identifyWeakZones(
  proportions: ProportionComparison[]
): WeakZone[] {
  const weak = proportions.filter(
    (p) => p.status === "BELOW" && p.deviationPercent <= WEAK_ZONE_THRESHOLD
  );

  return weak.map((p) => {
    let severity: WeakZone["severity"] = "MILD";
    if (p.deviationPercent <= -15) severity = "SIGNIFICANT";
    else if (p.deviationPercent <= -10) severity = "MODERATE";

    return {
      key: p.key,
      labelUk: MEASUREMENT_LABELS[p.key],
      deviationPercent: p.deviationPercent,
      severity,
      recommendationUk: RECOMMENDATIONS[p.key],
    };
  });
}

/** Слабкі зони без замірів — евристика за метою та BMI */
export function inferGeneralWeakZones(input: {
  goal: string;
  bmiCategory: string;
  activityLevel: string;
}): WeakZone[] {
  const zones: WeakZone[] = [];

  if (input.goal === "GAIN") {
    zones.push({
      key: "chest",
      labelUk: "Загальний обсяг",
      deviationPercent: -8,
      severity: "MODERATE",
      recommendationUk:
        "Фокус на базові вправи (присід, жим, тяга) та профіцит калорій.",
    });
  }

  if (input.goal === "LOSS" && input.bmiCategory !== "NORMAL") {
    zones.push({
      key: "waist",
      labelUk: "Склад тіла",
      deviationPercent: -12,
      severity: "MODERATE",
      recommendationUk:
        "Дефіцит калорій 300–500 ккал, кроки 8k+ та силові 3×/тиж.",
    });
  }

  if (
    input.activityLevel === "SEDENTARY" ||
    input.activityLevel === "LIGHT"
  ) {
    zones.push({
      key: "thigh",
      labelUk: "Витривалість",
      deviationPercent: -6,
      severity: "MILD",
      recommendationUk:
        "Підвищте NEAT: прогулянки, сходи, 2–3 кардіо-сесії на тиждень.",
    });
  }

  return zones;
}
