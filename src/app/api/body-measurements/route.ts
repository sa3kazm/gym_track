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
import { bodyMeasurementsSchema } from "@/lib/validations/body-measurements";

/** GET /api/body-measurements */
export async function GET() {
  try {
    const profile = await requireDefaultProfile();
    const row = await prisma.bodyMeasurements.findUnique({
      where: { profileId: profile.id },
    });
    return jsonOk(row);
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}

/** PUT /api/body-measurements */
export async function PUT(request: Request) {
  try {
    const profile = await requireDefaultProfile();
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Невалідний JSON", 400);

    const input = bodyMeasurementsSchema.parse(body);

    const row = await prisma.bodyMeasurements.upsert({
      where: { profileId: profile.id },
      create: { profileId: profile.id, ...input },
      update: input,
    });

    return jsonOk(row);
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}
