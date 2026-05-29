import type { Gender } from "@prisma/client";
import type {
  BodyMeasurementsInput,
  McCallumIdeal,
  MeasurementKey,
  ProportionComparison,
} from "./types";

/** Множники Джона МакКаллума (від обхвату зап'ястя в дюймах) */
export const MCCALLUM_MULTIPLIERS: Record<MeasurementKey, number> = {
  chest: 6.5,
  hips: 5.76,
  waist: 4.5,
  thigh: 3.44,
  neck: 2.52,
  bicep: 2.52,
  forearm: 1.88,
  calf: 2.34,
};

export const MEASUREMENT_LABELS: Record<MeasurementKey, string> = {
  chest: "Груди",
  hips: "Стегна",
  waist: "Талія",
  thigh: "Стегно",
  neck: "Шия",
  bicep: "Біцепс",
  forearm: "Передпліччя",
  calf: "Литка",
};

const MEASUREMENT_FIELD_MAP: Record<
  MeasurementKey,
  keyof BodyMeasurementsInput
> = {
  chest: "chestCm",
  hips: "hipsCm",
  waist: "waistCm",
  thigh: "thighCm",
  neck: "neckCm",
  bicep: "bicepCm",
  forearm: "forearmCm",
  calf: "calfCm",
};

/** Орієнтовне зап'ястя зі зросту (см), якщо не виміряно */
export function estimateWristCm(heightCm: number, gender: Gender): number {
  const factor = gender === "FEMALE" ? 0.099 : 0.104;
  return Math.round(heightCm * factor * 10) / 10;
}

export function calculateMcCallumIdeal(
  wristCm: number
): Record<MeasurementKey, number> {
  const wristIn = wristCm / 2.54;
  const ideals = {} as Record<MeasurementKey, number>;

  for (const [key, mult] of Object.entries(MCCALLUM_MULTIPLIERS) as [
    MeasurementKey,
    number,
  ][]) {
    ideals[key] = Math.round(wristIn * mult * 2.54 * 10) / 10;
  }

  return ideals;
}

export function resolveMcCallum(
  heightCm: number,
  gender: Gender,
  measurements?: BodyMeasurementsInput | null
): McCallumIdeal {
  const wristEstimated = !measurements?.wristCm;
  const wristCm =
    measurements?.wristCm ?? estimateWristCm(heightCm, gender);

  return {
    wristCm,
    wristEstimated,
    idealsCm: calculateMcCallumIdeal(wristCm),
  };
}

export function compareProportions(
  idealsCm: Record<MeasurementKey, number>,
  measurements?: BodyMeasurementsInput | null
): ProportionComparison[] {
  const results: ProportionComparison[] = [];

  for (const key of Object.keys(MCCALLUM_MULTIPLIERS) as MeasurementKey[]) {
    const field = MEASUREMENT_FIELD_MAP[key];
    const actual = measurements?.[field];
    if (actual == null || actual <= 0) continue;

    const idealCm = idealsCm[key];
    const ratio = actual / idealCm;
    const deviationPercent = Math.round((ratio - 1) * 100);

    let status: ProportionComparison["status"] = "ON_TARGET";
    if (ratio < 0.95) status = "BELOW";
    else if (ratio > 1.05) status = "ABOVE";

    results.push({
      key,
      labelUk: MEASUREMENT_LABELS[key],
      actualCm: actual,
      idealCm,
      ratio: Math.round(ratio * 1000) / 1000,
      deviationPercent,
      status,
    });
  }

  return results.sort((a, b) => a.deviationPercent - b.deviationPercent);
}
