import { prisma } from "@/lib/prisma";
import {
  sumMacros,
  parseLogDate,
  toDateOnlyString,
  calculateMacrosFrom100g,
} from "@/lib/nutrition/macros";

function dayRange(dateStr: string) {
  const start = parseLogDate(dateStr);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}
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
import { createNutritionEntrySchema } from "@/lib/validations/nutrition";
import type { MealType } from "@prisma/client";

const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACKS"];

/** GET /api/nutrition?date=YYYY-MM-DD */
export async function GET(request: Request) {
  try {
    const profile = await requireDefaultProfile();
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date") ?? toDateOnlyString();
    const { start, end } = dayRange(dateStr);

    const [entries, prefs] = await Promise.all([
      prisma.nutritionEntry.findMany({
        where: {
          profileId: profile.id,
          logDate: { gte: start, lt: end },
        },
        include: { food: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.trainingPreferences.findUnique({
        where: { profileId: profile.id },
      }),
    ]);

    const meals: Record<string, typeof entries> = {
      BREAKFAST: [],
      LUNCH: [],
      DINNER: [],
      SNACKS: [],
    };

    for (const e of entries) {
      meals[e.mealType].push(e);
    }

    const totals = sumMacros(entries);

    return jsonOk({
      date: dateStr,
      meals,
      totals,
      goals: prefs
        ? {
            calories: prefs.dailyCalories,
            protein: prefs.dailyProteinG,
            fat: prefs.dailyFatG,
            carbs: prefs.dailyCarbsG,
            water: prefs.dailyWaterMl,
          }
        : null,
    });
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}

/** POST /api/nutrition — додати продукт у прийом їжі */
export async function POST(request: Request) {
  try {
    const profile = await requireDefaultProfile();
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Невалідний JSON", 400);

    const input = createNutritionEntrySchema.parse(body);
    if (!MEAL_TYPES.includes(input.mealType)) {
      return jsonError("Невідомий прийом їжі", 400);
    }

    const food = await prisma.food.findFirst({
      where: {
        id: input.foodId,
        OR: [{ profileId: null }, { profileId: profile.id }],
      },
    });
    if (!food) return jsonError("Продукт не знайдено", 404);

    const macros = calculateMacrosFrom100g(food, input.grams);
    const logDate = parseLogDate(input.date ?? toDateOnlyString());

    const entry = await prisma.nutritionEntry.create({
      data: {
        profileId: profile.id,
        logDate,
        mealType: input.mealType,
        foodId: food.id,
        grams: input.grams,
        ...macros,
      },
      include: { food: true },
    });

    return jsonCreated(entry);
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}
