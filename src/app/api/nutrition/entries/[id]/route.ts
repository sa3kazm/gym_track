import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  jsonError,
  jsonOk,
} from "@/lib/api/response";
import {
  ProfileNotFoundError,
  requireDefaultProfile,
} from "@/lib/api/profile-context";

type Params = { params: Promise<{ id: string }> };

/** DELETE /api/nutrition/entries/:id */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const profile = await requireDefaultProfile();

    const entry = await prisma.nutritionEntry.findUnique({ where: { id } });
    if (!entry || entry.profileId !== profile.id) {
      return jsonError("Запис не знайдено", 404);
    }

    await prisma.nutritionEntry.delete({ where: { id } });
    return jsonOk({ deleted: true });
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}
