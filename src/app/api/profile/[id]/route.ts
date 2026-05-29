import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  jsonError,
  jsonOk,
  parseJsonBody,
} from "@/lib/api/response";
import { updateProfileSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

/** GET /api/profile/:id */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const profile = await prisma.profile.findUnique({
      where: { id },
      include: { trainingPreferences: true },
    });
    if (!profile) return jsonError("Профіль не знайдено", 404);
    return jsonOk(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

/** PATCH /api/profile/:id */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Невалідний JSON", 400);

    const input = updateProfileSchema.parse(body);

    const profile = await prisma.profile.update({
      where: { id },
      data: input,
      include: { trainingPreferences: true },
    });

    return jsonOk(profile);
  } catch (error) {
    return handleApiError(error);
  }
}
