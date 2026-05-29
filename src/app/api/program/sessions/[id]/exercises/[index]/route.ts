import { prisma } from "@/lib/prisma";
import { updatePrescriptionExerciseSchema } from "@/lib/validations/program-session";
import {
  handleApiError,
  jsonError,
  jsonOk,
  parseJsonBody,
} from "@/lib/api/response";
import {
  ProfileNotFoundError,
  requireDefaultProfile,
} from "@/lib/api/profile-context";
import { getActiveProgram, saveProgram } from "@/lib/program/active-plan";
import { EXERCISE_CATALOG } from "@/lib/program-engine/exercise-catalog";

type Params = { params: Promise<{ id: string; index: string }> };

/** PATCH /api/program/sessions/:id/exercises/:index */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id: sessionId, index: indexStr } = await params;
    const exerciseIndex = Number(indexStr);
    if (Number.isNaN(exerciseIndex) || exerciseIndex < 0) {
      return jsonError("Невалідний індекс вправи", 400);
    }

    const profile = await requireDefaultProfile();
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Невалідний JSON", 400);

    const input = updatePrescriptionExerciseSchema.parse(body);
    const active = await getActiveProgram(profile.id);
    if (!active) return jsonError("Активну програму не знайдено", 404);

    const { plan, program } = active;
    const session = program.sessions.find((s) => s.id === sessionId);
    if (!session) return jsonError("Тренування не знайдено", 404);

    const ex = session.exercises[exerciseIndex];
    if (!ex) return jsonError("Вправу не знайдено", 404);

    if (input.replaceExerciseId) {
      const dbEx = await prisma.exercise.findUnique({
        where: { id: input.replaceExerciseId },
      });
      if (!dbEx) return jsonError("Вправу не знайдено в бібліотеці", 404);

      const catalog = EXERCISE_CATALOG.find((c) => c.name === dbEx.name);

      ex.exerciseId = dbEx.id;
      ex.name = dbEx.name;
      ex.slug = catalog?.slug ?? dbEx.id;
      ex.category = dbEx.category;
    }

    if (input.sets !== undefined) ex.sets = input.sets;
    if (input.reps !== undefined) ex.reps = input.reps;
    if (input.rpe !== undefined) ex.rpe = input.rpe;
    if (input.restSeconds !== undefined) ex.restSeconds = input.restSeconds;
    if (input.notes !== undefined) ex.notes = input.notes;

    const totalSets = session.exercises.reduce((s, e) => s + e.sets, 0);
    session.estimatedMinutes = Math.round(
      session.exercises.length * 4 + totalSets * 2.5 + 10
    );

    await saveProgram(plan.id, program);

    return jsonOk({ session, exercise: ex });
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}
