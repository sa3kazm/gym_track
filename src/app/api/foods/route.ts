import { prisma } from "@/lib/prisma";
import { ensureBuiltinFoods } from "@/lib/nutrition/ensure-foods";
import {
  handleApiError,
  jsonCreated,
  jsonError,
  jsonOk,
  parseJsonBody,
} from "@/lib/api/response";
import {
  getDefaultProfile,
  ProfileNotFoundError,
  requireDefaultProfile,
} from "@/lib/api/profile-context";
import { createFoodSchema } from "@/lib/validations/nutrition";

/** GET /api/foods?q=&category= */
export async function GET(request: Request) {
  try {
    try {
      await ensureBuiltinFoods();
    } catch (dbError) {
      console.error("[foods] ensureBuiltinFoods", dbError);
      return jsonError(
        "База продуктів не налаштована. У терміналі: npm run db:push",
        503
      );
    }

    const profile = await getDefaultProfile();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const category = searchParams.get("category");

    const foods = await prisma.food.findMany({
      where: {
        OR: profile
          ? [{ profileId: null }, { profileId: profile.id }]
          : [{ profileId: null }],
        ...(q
          ? {
              name: {
                contains: q,
              },
            }
          : {}),
        ...(category ? { category: category as never } : {}),
      },
      orderBy: [{ isCustom: "asc" }, { name: "asc" }],
      take: 100,
    });

    return jsonOk({
      foods,
      profileRequired: !profile,
    });
  } catch (error) {
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
