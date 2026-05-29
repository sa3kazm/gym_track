import { prisma } from "@/lib/prisma";
import { toWorkoutPlanDto } from "@/lib/mappers";
import {
  handleApiError,
  jsonError,
  jsonOk,
  parseJsonBody,
} from "@/lib/api/response";
import {
  serializeSchedule,
  updateWorkoutPlanSchema,
} from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

/** GET /api/workout-plans/:id */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const plan = await prisma.workoutPlan.findUnique({ where: { id } });
    if (!plan) return jsonError("План не знайдено", 404);
    return jsonOk(toWorkoutPlanDto(plan));
  } catch (error) {
    return handleApiError(error);
  }
}

/** PATCH /api/workout-plans/:id */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Невалідний JSON", 400);

    const input = updateWorkoutPlanSchema.parse(body);

    const plan = await prisma.workoutPlan.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.schedule !== undefined
          ? { schedule: serializeSchedule(input.schedule) }
          : {}),
      },
    });

    return jsonOk(toWorkoutPlanDto(plan));
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/workout-plans/:id */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.workoutPlan.delete({ where: { id } });
    return jsonOk({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
