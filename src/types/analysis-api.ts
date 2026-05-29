import type { BodyAnalysisResult } from "@/lib/analysis";

export interface AnalysisSummaryResponse {
  success: boolean;
  data?: {
    profile: {
      id: string;
      name: string;
      goal: string;
      activityLevel: string;
    };
    weightKg: number;
    targetWeightKg: number | null;
    hasMeasurements: boolean;
    analysis: BodyAnalysisResult;
    nutrition: {
      dailyCalories: number;
      dailyProteinG: number;
      dailyFatG: number;
      dailyCarbsG: number;
      dailyWaterMl: number;
    } | null;
  };
  error?: string;
}
