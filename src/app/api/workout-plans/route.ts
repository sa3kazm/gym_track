import { prisma } from "@/lib/prisma";
import { toWorkoutPlanDto } from "@/lib/mappers";
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
  createWorkoutPlanSchema,
  serializeSchedule,
} from "@/lib/validations";

/** GET /api/workout-plans */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId =
      searchParams.get("profileId") ??
      (await requireDefaultProfile()).id;

    const plans = await prisma.workoutPlan.findMany({
      where: { profileId },
      orderBy: { updatedAt: "desc" },
    });

    return jsonOk(plans.map(toWorkoutPlanDto));
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}

/** POST /api/workout-plans */
export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Невалідний JSON", 400);

    const input = createWorkoutPlanSchema.parse(body);
    const profileId =
      input.profileId ?? (await requireDefaultProfile()).id;

    const schedule = input.schedule ?? { days: [] };

    const plan = await prisma.workoutPlan.create({
      data: {
        profileId,
        name: input.name,
        description: input.description ?? null,
        schedule: serializeSchedule(schedule),
      },
    });

    return jsonCreated(toWorkoutPlanDto(plan));
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}
