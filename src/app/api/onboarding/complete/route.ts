import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  jsonCreated,
  jsonError,
  parseJsonBody,
} from "@/lib/api/response";
import { onboardingFormSchema } from "@/lib/validations/onboarding";

/** POST /api/onboarding/complete — атомарне збереження онбордингу */
export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Невалідний JSON", 400);

    const input = onboardingFormSchema.parse(body);

    const existing = await prisma.profile.findFirst();

    const result = await prisma.$transaction(async (tx) => {
      const profile = existing
        ? await tx.profile.update({
            where: { id: existing.id },
            data: {
              name: input.name,
              age: input.age,
              gender: input.gender,
              heightCm: input.heightCm,
              targetWeightKg: input.targetWeightKg,
              goal: input.goal,
              activityLevel: input.activityLevel,
            },
          })
        : await tx.profile.create({
            data: {
              name: input.name,
              age: input.age,
              gender: input.gender,
              heightCm: input.heightCm,
              targetWeightKg: input.targetWeightKg,
              goal: input.goal,
              activityLevel: input.activityLevel,
              trainingPreferences: { create: {} },
            },
          });

      await tx.trainingPreferences.upsert({
        where: { profileId: profile.id },
        create: {
          profileId: profile.id,
          preferredSplit: input.preferredSplit || null,
          defaultRestSeconds: input.defaultRestSeconds,
          weightUnit: input.weightUnit,
          dailyCalories: input.dailyCalories,
          dailyProteinG: input.dailyProteinG,
          dailyFatG: input.dailyFatG,
          dailyCarbsG: input.dailyCarbsG,
          dailyWaterMl: input.dailyWaterMl,
        },
        update: {
          preferredSplit: input.preferredSplit || null,
          defaultRestSeconds: input.defaultRestSeconds,
          weightUnit: input.weightUnit,
          dailyCalories: input.dailyCalories,
          dailyProteinG: input.dailyProteinG,
          dailyFatG: input.dailyFatG,
          dailyCarbsG: input.dailyCarbsG,
          dailyWaterMl: input.dailyWaterMl,
        },
      });

      await tx.bodyMetrics.create({
        data: {
          profileId: profile.id,
          weightKg: input.currentWeightKg,
          recordedAt: new Date(),
        },
      });

      return profile;
    });

    return jsonCreated({ profileId: result.id });
  } catch (error) {
    return handleApiError(error);
  }
}
