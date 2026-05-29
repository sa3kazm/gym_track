import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  jsonError,
  jsonOk,
  parseJsonBody,
} from "@/lib/api/response";
import { updateExerciseSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

/** GET /api/exercises/:id */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const exercise = await prisma.exercise.findUnique({ where: { id } });
    if (!exercise) return jsonError("Вправу не знайдено", 404);
    return jsonOk(exercise);
  } catch (error) {
    return handleApiError(error);
  }
}

/** PATCH /api/exercises/:id */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const existing = await prisma.exercise.findUnique({ where: { id } });
    if (!existing) return jsonError("Вправу не знайдено", 404);
    if (!existing.isCustom) {
      return jsonError("Вбудовані вправи не можна редагувати", 403);
    }

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Невалідний JSON", 400);

    const input = updateExerciseSchema.parse(body);
    const exercise = await prisma.exercise.update({
      where: { id },
      data: input,
    });

    return jsonOk(exercise);
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/exercises/:id */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const existing = await prisma.exercise.findUnique({ where: { id } });
    if (!existing) return jsonError("Вправу не знайдено", 404);
    if (!existing.isCustom) {
      return jsonError("Вбудовані вправи не можна видаляти", 403);
    }

    await prisma.exercise.delete({ where: { id } });
    return jsonOk({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
