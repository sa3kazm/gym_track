import { prisma } from "@/lib/prisma";
import { toWorkoutSessionDto } from "@/lib/mappers";
import {
  handleApiError,
  jsonError,
  jsonOk,
  parseJsonBody,
} from "@/lib/api/response";
import {
  computeTotalVolume,
  serializeExercises,
  updateWorkoutSessionSchema,
} from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

/** GET /api/workout-sessions/:id */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await prisma.workoutSession.findUnique({ where: { id } });
    if (!session) return jsonError("Сесію не знайдено", 404);
    return jsonOk(toWorkoutSessionDto(session));
  } catch (error) {
    return handleApiError(error);
  }
}

/** PATCH /api/workout-sessions/:id */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Невалідний JSON", 400);

    const input = updateWorkoutSessionSchema.parse(body);

    const existing = await prisma.workoutSession.findUnique({ where: { id } });
    if (!existing) return jsonError("Сесію не знайдено", 404);

    let exercisesJson = existing.exercises;
    let totalVolume = existing.totalVolume;

    if (input.exercises !== undefined) {
      exercisesJson = serializeExercises(input.exercises);
      totalVolume =
        input.totalVolume ?? computeTotalVolume(input.exercises);
    } else if (input.totalVolume !== undefined) {
      totalVolume = input.totalVolume;
    }

    const session = await prisma.workoutSession.update({
      where: { id },
      data: {
        ...(input.workoutPlanId !== undefined
          ? { workoutPlanId: input.workoutPlanId }
          : {}),
        ...(input.planDayId !== undefined ? { planDayId: input.planDayId } : {}),
        ...(input.sessionDate !== undefined
          ? { sessionDate: input.sessionDate }
          : {}),
        ...(input.endedAt !== undefined ? { endedAt: input.endedAt } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        exercises: exercisesJson,
        totalVolume,
      },
    });

    return jsonOk(toWorkoutSessionDto(session));
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/workout-sessions/:id */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.workoutSession.delete({ where: { id } });
    return jsonOk({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
