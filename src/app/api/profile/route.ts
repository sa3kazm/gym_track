import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  jsonCreated,
  jsonError,
  jsonOk,
  parseJsonBody,
} from "@/lib/api/response";
import { getDefaultProfile } from "@/lib/api/profile-context";
import { createProfileSchema, updateProfileSchema } from "@/lib/validations";

/** GET /api/profile — активний профіль */
export async function GET() {
  try {
    const profile = await getDefaultProfile();
    if (!profile) {
      return jsonError("Профіль не знайдено", 404);
    }
    return jsonOk(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

/** POST /api/profile — створити профіль + TrainingPreferences */
export async function POST(request: Request) {
  try {
    const existing = await getDefaultProfile();
    if (existing) {
      return jsonError("Профіль вже існує. Використайте PATCH /api/profile", 409);
    }

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Невалідний JSON", 400);

    const input = createProfileSchema.parse(body);

    const profile = await prisma.profile.create({
      data: {
        ...input,
        trainingPreferences: { create: {} },
      },
      include: { trainingPreferences: true },
    });

    return jsonCreated(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

/** PATCH /api/profile — оновити активний профіль */
export async function PATCH(request: Request) {
  try {
    const profile = await getDefaultProfile();
    if (!profile) {
      return jsonError("Профіль не знайдено", 404);
    }

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Невалідний JSON", 400);

    const input = updateProfileSchema.parse(body);

    const updated = await prisma.profile.update({
      where: { id: profile.id },
      data: input,
      include: { trainingPreferences: true },
    });

    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
