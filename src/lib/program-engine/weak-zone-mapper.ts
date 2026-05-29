import type { ExerciseCategory } from "@prisma/client";
import type { MeasurementKey } from "@/lib/analysis/types";
import type { InjuryFlag } from "./types";

const ZONE_TO_MUSCLE: Record<MeasurementKey, ExerciseCategory> = {
  chest: "CHEST",
  hips: "LEGS",
  waist: "CORE",
  thigh: "LEGS",
  neck: "SHOULDERS",
  bicep: "ARMS",
  forearm: "ARMS",
  calf: "LEGS",
};

const ZONE_TO_INJURY: Partial<Record<MeasurementKey, InjuryFlag>> = {
  waist: "LOWER_BACK",
  thigh: "KNEE",
};

export function musclesFromWeakZones(
  zoneKeys: string[]
): ExerciseCategory[] {
  const set = new Set<ExerciseCategory>();
  for (const key of zoneKeys) {
    const muscle = ZONE_TO_MUSCLE[key as MeasurementKey];
    if (muscle) set.add(muscle);
  }
  return [...set];
}

export function injuriesFromZones(zoneKeys: string[]): InjuryFlag[] {
  const set = new Set<InjuryFlag>();
  for (const key of zoneKeys) {
    const injury = ZONE_TO_INJURY[key as MeasurementKey];
    if (injury) set.add(injury);
  }
  return [...set];
}
