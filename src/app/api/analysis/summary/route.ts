import { prisma } from "@/lib/prisma";
import { buildAnalysisInput } from "@/lib/analysis/build-input";
import { runBodyAnalysis } from "@/lib/analysis";
import {
  handleApiError,
  jsonError,
  jsonOk,
} from "@/lib/api/response";
import { ProfileNotFoundError } from "@/lib/api/profile-context";

/** GET /api/analysis/summary */
export async function GET() {
  try {
    const profile = await prisma.profile.findFirst({
      include: {
        bodyMeasurements: true,
        trainingPreferences: true,
        bodyMetrics: {
          orderBy: { recordedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!profile) {
      throw new ProfileNotFoundError();
    }

    const latestMetric = profile.bodyMetrics[0];
    const weightKg = latestMetric?.weightKg ?? profile.targetWeightKg ?? 70;

    const input = buildAnalysisInput(
      profile,
      weightKg,
      profile.bodyMeasurements,
      latestMetric?.bodyFatPercent
    );

    const analysis = runBodyAnalysis(input);

    return jsonOk({
      profile: {
        id: profile.id,
        name: profile.name,
        goal: profile.goal,
        activityLevel: profile.activityLevel,
      },
      weightKg,
      targetWeightKg: profile.targetWeightKg,
      hasMeasurements: Boolean(
        profile.bodyMeasurements &&
          Object.values({
            wristCm: profile.bodyMeasurements.wristCm,
            chestCm: profile.bodyMeasurements.chestCm,
            waistCm: profile.bodyMeasurements.waistCm,
          }).some((v) => v != null)
      ),
      analysis,
      nutrition: profile.trainingPreferences
        ? {
            dailyCalories: profile.trainingPreferences.dailyCalories,
            dailyProteinG: profile.trainingPreferences.dailyProteinG,
            dailyFatG: profile.trainingPreferences.dailyFatG,
            dailyCarbsG: profile.trainingPreferences.dailyCarbsG,
            dailyWaterMl: profile.trainingPreferences.dailyWaterMl,
          }
        : null,
    });
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}
