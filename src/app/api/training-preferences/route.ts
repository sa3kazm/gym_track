import { prisma } from "@/lib/prisma";
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
import { updateTrainingPreferencesSchema } from "@/lib/validations";

/** GET /api/training-preferences?profileId= */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId =
      searchParams.get("profileId") ??
      (await requireDefaultProfile()).id;

    const prefs = await prisma.trainingPreferences.findUnique({
      where: { profileId },
    });

    if (!prefs) return jsonError("Налаштування не знайдено", 404);
    return jsonOk(prefs);
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}

/** PATCH /api/training-preferences — оновити налаштування активного профілю */
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId =
      searchParams.get("profileId") ??
      (await requireDefaultProfile()).id;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Невалідний JSON", 400);

    const input = updateTrainingPreferencesSchema.parse(body);

    const prefs = await prisma.trainingPreferences.update({
      where: { profileId },
      data: input,
    });

    return jsonOk(prefs);
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}
