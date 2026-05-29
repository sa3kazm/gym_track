import { prisma } from "@/lib/prisma";
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
import { createExerciseSchema } from "@/lib/validations";

/** GET /api/exercises?q=&customOnly= */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const customOnly = searchParams.get("customOnly") === "true";

    const profile = await requireDefaultProfile();

    const exercises = await prisma.exercise.findMany({
      where: {
        OR: [{ profileId: null }, { profileId: profile.id }],
        ...(customOnly ? { isCustom: true, profileId: profile.id } : {}),
        ...(q
          ? { name: { contains: q } }
          : {}),
      },
      orderBy: [{ isCustom: "asc" }, { name: "asc" }],
    });

    return jsonOk(exercises);
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}

/** POST /api/exercises — кастомна вправа */
export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Невалідний JSON", 400);

    const input = createExerciseSchema.parse(body);
    const profile = await requireDefaultProfile();

    const exercise = await prisma.exercise.create({
      data: {
        name: input.name,
        category: input.category ?? "OTHER",
        equipment: input.equipment ?? "OTHER",
        isCustom: input.isCustom ?? true,
        profileId: input.profileId ?? profile.id,
      },
    });

    return jsonCreated(exercise);
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}
