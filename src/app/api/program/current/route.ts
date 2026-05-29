import { prisma } from "@/lib/prisma";
import { parseProgram, isProgramV2 } from "@/lib/program/schedule";
import {
  handleApiError,
  jsonError,
  jsonOk,
} from "@/lib/api/response";
import {
  ProfileNotFoundError,
  requireDefaultProfile,
} from "@/lib/api/profile-context";

/** GET /api/program/current */
export async function GET() {
  try {
    const profile = await requireDefaultProfile();

    const plan = await prisma.workoutPlan.findFirst({
      where: { profileId: profile.id },
      orderBy: { createdAt: "desc" },
    });

    if (!plan || !isProgramV2(plan.schedule)) {
      return jsonOk({ plan: null, program: null });
    }

    const program = parseProgram(plan.schedule);

    return jsonOk({
      plan: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        createdAt: plan.createdAt,
      },
      program,
    });
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}
