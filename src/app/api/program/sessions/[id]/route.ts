import { prisma } from "@/lib/prisma";
import { parseProgram, serializeProgram, isProgramV2 } from "@/lib/program/schedule";
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
import { z } from "zod";

const patchSchema = z.object({
  completed: z.boolean(),
});

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/program/sessions/:id — позначити тренування виконаним */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id: sessionId } = await params;
    const profile = await requireDefaultProfile();
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Невалідний JSON", 400);

    const { completed } = patchSchema.parse(body);

    const plan = await prisma.workoutPlan.findFirst({
      where: { profileId: profile.id },
      orderBy: { createdAt: "desc" },
    });

    if (!plan || !isProgramV2(plan.schedule)) {
      return jsonError("Активну програму не знайдено", 404);
    }

    const program = parseProgram(plan.schedule);
    const session = program.sessions.find((s) => s.id === sessionId);
    if (!session) return jsonError("Тренування не знайдено", 404);

    session.completed = completed;

    await prisma.workoutPlan.update({
      where: { id: plan.id },
      data: { schedule: serializeProgram(program) },
    });

    return jsonOk({ session });
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}
