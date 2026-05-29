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
import { createFoodSchema } from "@/lib/validations/nutrition";

/** GET /api/foods?q=&category= */
export async function GET(request: Request) {
  try {
    const profile = await requireDefaultProfile();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim().toLowerCase();
    const category = searchParams.get("category");

    const foods = await prisma.food.findMany({
      where: {
        OR: [{ profileId: null }, { profileId: profile.id }],
        ...(q ? { name: { contains: q } } : {}),
        ...(category ? { category: category as never } : {}),
      },
      orderBy: [{ isCustom: "asc" }, { name: "asc" }],
      take: 50,
    });

    return jsonOk(foods);
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}

/** POST /api/foods — кастомний продукт */
export async function POST(request: Request) {
  try {
    const profile = await requireDefaultProfile();
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Невалідний JSON", 400);

    const input = createFoodSchema.parse(body);

    const food = await prisma.food.create({
      data: {
        ...input,
        profileId: profile.id,
        isCustom: true,
      },
    });

    return jsonCreated(food);
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}
