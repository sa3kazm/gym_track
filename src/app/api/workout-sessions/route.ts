import { prisma } from "@/lib/prisma";
import { toWorkoutSessionDto } from "@/lib/mappers";
import {
  handleApiError,
  jsonCreated,
  jsonError,
  jsonOk,
  parseJsonBody,
} from "@/lib/api/response";
import {
  ProfileNotFoundError,
  requireDefaultProfile,
} from "@/lib/api/profile-context";
import {
  computeTotalVolume,
  createWorkoutSessionSchema,
  serializeExercises,
} from "@/lib/validations";

/** GET /api/workout-sessions?from=&to=&limit= */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId =
      searchParams.get("profileId") ??
      (await requireDefaultProfile()).id;

    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);

    const sessions = await prisma.workoutSession.findMany({
      where: {
        profileId,
        ...(from || to
          ? {
              sessionDate: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      orderBy: { sessionDate: "desc" },
      take: limit,
    });

    return jsonOk(sessions.map(toWorkoutSessionDto));
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}

/** POST /api/workout-sessions — почати / створити сесію */
export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Невалідний JSON", 400);

    const input = createWorkoutSessionSchema.parse(body);
    const profileId =
      input.profileId ?? (await requireDefaultProfile()).id;

    const exercises = input.exercises ?? [];
    const totalVolume = computeTotalVolume(exercises);

    const session = await prisma.workoutSession.create({
      data: {
        profileId,
        workoutPlanId: input.workoutPlanId ?? null,
        planDayId: input.planDayId ?? null,
        sessionDate: input.sessionDate ?? new Date(),
        startedAt: input.startedAt ?? new Date(),
        exercises: serializeExercises(exercises),
        totalVolume,
        notes: input.notes ?? null,
      },
    });

    return jsonCreated(toWorkoutSessionDto(session));
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}
