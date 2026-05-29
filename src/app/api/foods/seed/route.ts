import { ensureBuiltinFoods } from "@/lib/nutrition/ensure-foods";
import { handleApiError, jsonError, jsonOk } from "@/lib/api/response";

/** POST /api/foods/seed — завантажити базу продуктів */
export async function POST() {
  try {
    const count = await ensureBuiltinFoods();
    return jsonOk({ count, message: `Завантажено ${count} продуктів` });
  } catch (error) {
    console.error("[foods/seed]", error);
    return jsonError(
      "Не вдалося завантажити продукти. Спочатку виконайте: npm run db:push",
      503
    );
  }
}
