import { prisma } from "@/lib/prisma";
import {
  computeTotalVolume,
  serializeExercises,
} from "@/lib/validations/workout-session";
import { completeProgramSessionSchema } from "@/lib/validations/program-session";
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

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/program/sessions/:id — виконання + лог ваги/повторів */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id: sessionId } = await params;
    const profile = await requireDefaultProfile();
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Невалідний JSON", 400);

    const input = completeProgramSessionSchema.parse(body);
    const active = await getActiveProgram(profile.id);
    if (!active) return jsonError("Активну програму не знайдено", 404);

    const { plan, program } = active;
    const session = program.sessions.find((s) => s.id === sessionId);
    if (!session) return jsonError("Тренування не знайдено", 404);

    if (input.completed) {
      if (!input.logs || input.logs.length === 0) {
        return jsonError(
          "Додайте лог підходів (вага та повторення) перед завершенням",
          422
        );
      }

      const dbExercises = input.logs.map((log) => ({
        exerciseId: log.exerciseId,
        sets: log.sets.map((s) => ({
          weightKg: s.weightKg,
          reps: s.reps,
          completedAt: new Date().toISOString(),
        })),
      }));

      const totalVolume = computeTotalVolume(dbExercises);

      if (session.workoutLogId) {
        await prisma.workoutSession.update({
          where: { id: session.workoutLogId },
          data: {
            endedAt: new Date(),
            exercises: serializeExercises(dbExercises),
            totalVolume,
            notes: input.notes ?? null,
            sessionDate: new Date(session.date),
          },
        });
      } else {
        const log = await prisma.workoutSession.create({
          data: {
            profileId: profile.id,
            workoutPlanId: plan.id,
            planDayId: session.id,
            sessionDate: new Date(session.date),
            startedAt: new Date(),
            endedAt: new Date(),
            exercises: serializeExercises(dbExercises),
            totalVolume,
            notes: input.notes ?? null,
          },
        });
        session.workoutLogId = log.id;
      }

      session.completed = true;
      session.totalVolumeLogged = totalVolume;
      session.completedAt = new Date().toISOString();
    } else {
      session.completed = false;
      session.completedAt = undefined;
      session.totalVolumeLogged = undefined;

      if (session.workoutLogId) {
        await prisma.workoutSession.delete({
          where: { id: session.workoutLogId },
        }).catch(() => {});
        session.workoutLogId = undefined;
      }
    }

    await saveProgram(plan.id, program);

    return jsonOk({ session });
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}
