import { prisma } from "@/lib/prisma";
import { buildAnalysisInput } from "@/lib/analysis/build-input";
import { runBodyAnalysis } from "@/lib/analysis";
import {
  generateProgram,
  type ProgramGenerationInput,
  type SplitType,
} from "@/lib/program-engine";
import {
  injuriesFromZones,
  musclesFromWeakZones,
} from "@/lib/program-engine/weak-zone-mapper";
import { serializeProgram } from "@/lib/program/schedule";
import { getSplitLabel } from "@/lib/program-engine/split-selector";
import {
  handleApiError,
  jsonCreated,
  jsonError,
  parseJsonBody,
} from "@/lib/api/response";
import {
  ProfileNotFoundError,
  requireDefaultProfile,
} from "@/lib/api/profile-context";
import { generateProgramSchema } from "@/lib/validations/program-generation";
import type { Equipment, Goal } from "@prisma/client";

/** POST /api/program/generate */
export async function POST(request: Request) {
  try {
    const profile = await requireDefaultProfile();
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Невалідний JSON", 400);

    const payload = generateProgramSchema.parse(body);

    let priorityMuscles = payload.priorityMuscles;
    let injuries = payload.injuries;

    if (payload.useWeakZones) {
      const fullProfile = await prisma.profile.findUnique({
        where: { id: profile.id },
        include: {
          bodyMeasurements: true,
          bodyMetrics: { orderBy: { recordedAt: "desc" }, take: 1 },
        },
      });

      if (fullProfile) {
        const weight =
          fullProfile.bodyMetrics[0]?.weightKg ??
          fullProfile.targetWeightKg ??
          70;
        const analysis = runBodyAnalysis(
          buildAnalysisInput(
            fullProfile,
            weight,
            fullProfile.bodyMeasurements
          )
        );
        const zoneKeys = analysis.weakZones.map((z) => z.key);
        priorityMuscles = [
          ...new Set([
            ...priorityMuscles,
            ...musclesFromWeakZones(zoneKeys),
          ]),
        ];
        injuries = [...new Set([...injuries, ...injuriesFromZones(zoneKeys)])];
      }
    }

    const prefs = await prisma.trainingPreferences.findUnique({
      where: { profileId: profile.id },
    });

    const exercises = await prisma.exercise.findMany({
      where: { OR: [{ profileId: null }, { profileId: profile.id }] },
    });

    const input: ProgramGenerationInput = {
      daysPerWeek: payload.daysPerWeek,
      goal: (payload.goal ?? profile.goal) as Goal,
      experienceLevel: payload.experienceLevel,
      availableEquipment: payload.availableEquipment as Equipment[],
      injuries,
      priorityMuscles,
      preferredSplit:
        payload.preferredSplit === "AUTO"
          ? "AUTO"
          : (payload.preferredSplit as SplitType),
      weeks: payload.weeks,
      restSeconds: payload.restSeconds ?? prefs?.defaultRestSeconds ?? 90,
      startDate: new Date(),
    };

    const program = generateProgram(input, exercises);

    const plan = await prisma.workoutPlan.create({
      data: {
        profileId: profile.id,
        name: `${getSplitLabel(program.splitType)} · ${program.weeks} тиж.`,
        description: `${program.daysPerWeek} дні/тиж · ${program.summary.totalSessions} тренувань`,
        schedule: serializeProgram(program),
      },
    });

    return jsonCreated({ planId: plan.id, program });
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}
