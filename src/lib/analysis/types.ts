import type { ActivityLevel, Gender, Goal } from "@prisma/client";

export type MeasurementKey =
  | "chest"
  | "hips"
  | "waist"
  | "thigh"
  | "neck"
  | "bicep"
  | "forearm"
  | "calf";

export interface BodyMeasurementsInput {
  wristCm?: number | null;
  neckCm?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  bicepCm?: number | null;
  forearmCm?: number | null;
  thighCm?: number | null;
  calfCm?: number | null;
}

export interface AnalysisInput {
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  goal: Goal;
  activityLevel: ActivityLevel;
  bodyFatPercent?: number | null;
  measurements?: BodyMeasurementsInput | null;
}

export type BmiCategory =
  | "UNDERWEIGHT"
  | "NORMAL"
  | "OVERWEIGHT"
  | "OBESE";

export interface BmiResult {
  value: number;
  category: BmiCategory;
  labelUk: string;
}

export interface BmrResult {
  bmr: number;
  tdee: number;
  formula: "mifflin-st-jeor";
}

export interface McCallumIdeal {
  wristCm: number;
  wristEstimated: boolean;
  idealsCm: Record<MeasurementKey, number>;
}

export interface ProportionComparison {
  key: MeasurementKey;
  labelUk: string;
  actualCm: number;
  idealCm: number;
  ratio: number;
  deviationPercent: number;
  status: "BELOW" | "ON_TARGET" | "ABOVE";
}

export interface WeakZone {
  key: MeasurementKey;
  labelUk: string;
  deviationPercent: number;
  severity: "MILD" | "MODERATE" | "SIGNIFICANT";
  recommendationUk: string;
}

export interface FitnessScoreBreakdown {
  total: number;
  bmiScore: number;
  proportionScore: number;
  goalScore: number;
  activityScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  labelUk: string;
}

export interface BodyAnalysisResult {
  bmi: BmiResult;
  bmr: BmrResult;
  mccallum: McCallumIdeal;
  proportions: ProportionComparison[];
  weakZones: WeakZone[];
  fitnessScore: FitnessScoreBreakdown;
  insights: string[];
}
