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

/** DELETE /api/foods/:id */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const profile = await requireDefaultProfile();

    const food = await prisma.food.findUnique({ where: { id } });
    if (!food) return jsonError("Продукт не знайдено", 404);
    if (!food.isCustom || food.profileId !== profile.id) {
      return jsonError("Вбудовані продукти не можна видаляти", 403);
    }

    await prisma.food.delete({ where: { id } });
    return jsonOk({ deleted: true });
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}
