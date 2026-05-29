import type { BodyMeasurements, Profile } from "@prisma/client";
import type { AnalysisInput, BodyMeasurementsInput } from "./types";

export function mapMeasurements(
  row: BodyMeasurements | null
): BodyMeasurementsInput | null {
  if (!row) return null;
  return {
    wristCm: row.wristCm,
    neckCm: row.neckCm,
    chestCm: row.chestCm,
    waistCm: row.waistCm,
    hipsCm: row.hipsCm,
    bicepCm: row.bicepCm,
    forearmCm: row.forearmCm,
    thighCm: row.thighCm,
    calfCm: row.calfCm,
  };
}

export function buildAnalysisInput(
  profile: Profile,
  weightKg: number,
  measurements: BodyMeasurements | null,
  bodyFatPercent?: number | null
): AnalysisInput {
  return {
    name: profile.name,
    age: profile.age ?? 25,
    gender: profile.gender,
    heightCm: profile.heightCm ?? 175,
    weightKg,
    targetWeightKg: profile.targetWeightKg ?? weightKg,
    goal: profile.goal,
    activityLevel: profile.activityLevel,
    bodyFatPercent,
    measurements: mapMeasurements(measurements),
  };
}
