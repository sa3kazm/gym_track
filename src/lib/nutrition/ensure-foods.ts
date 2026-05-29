import { prisma } from "@/lib/prisma";
import { BUILTIN_FOODS } from "@/lib/data/builtin-foods";

/** Якщо в БД немає вбудованих продуктів — додаємо з каталогу */
export async function ensureBuiltinFoods(): Promise<number> {
  const count = await prisma.food.count({
    where: { profileId: null, isCustom: false },
  });

  if (count > 0) return count;

  for (const f of BUILTIN_FOODS) {
    await prisma.food.create({
      data: {
        ...f,
        profileId: null,
        isCustom: false,
      },
    });
  }

  return BUILTIN_FOODS.length;
}
