import type { FoodCategory } from "@prisma/client";

export interface BuiltinFoodSeed {
  name: string;
  category: FoodCategory;
  caloriesPer100: number;
  proteinPer100: number;
  fatPer100: number;
  carbsPer100: number;
}

/** ~30 продуктів (як у старому README) */
export const BUILTIN_FOODS: BuiltinFoodSeed[] = [
  { name: "Куряче філе", category: "MEAT", caloriesPer100: 165, proteinPer100: 31, fatPer100: 3.6, carbsPer100: 0 },
  { name: "Яловичина (вирізка)", category: "MEAT", caloriesPer100: 250, proteinPer100: 26, fatPer100: 15, carbsPer100: 0 },
  { name: "Свинина (нежирна)", category: "MEAT", caloriesPer100: 143, proteinPer100: 21, fatPer100: 6, carbsPer100: 0 },
  { name: "Індичка", category: "MEAT", caloriesPer100: 135, proteinPer100: 30, fatPer100: 1, carbsPer100: 0 },
  { name: "Лосось", category: "FISH", caloriesPer100: 208, proteinPer100: 20, fatPer100: 13, carbsPer100: 0 },
  { name: "Тунець (консервований)", category: "FISH", caloriesPer100: 116, proteinPer100: 26, fatPer100: 1, carbsPer100: 0 },
  { name: "Яйце (1 шт ≈50г)", category: "DAIRY", caloriesPer100: 155, proteinPer100: 13, fatPer100: 11, carbsPer100: 1.1 },
  { name: "Творог 5%", category: "DAIRY", caloriesPer100: 121, proteinPer100: 17, fatPer100: 5, carbsPer100: 1.8 },
  { name: "Грецький йогурт", category: "DAIRY", caloriesPer100: 59, proteinPer100: 10, fatPer100: 0.4, carbsPer100: 3.6 },
  { name: "Молоко 2.5%", category: "DAIRY", caloriesPer100: 52, proteinPer100: 2.8, fatPer100: 2.5, carbsPer100: 4.7 },
  { name: "Сир твердий", category: "DAIRY", caloriesPer100: 402, proteinPer100: 25, fatPer100: 33, carbsPer100: 1.3 },
  { name: "Вівсянка", category: "GRAINS", caloriesPer100: 389, proteinPer100: 17, fatPer100: 7, carbsPer100: 66 },
  { name: "Рис білий (сухий)", category: "GRAINS", caloriesPer100: 365, proteinPer100: 7, fatPer100: 0.7, carbsPer100: 80 },
  { name: "Гречка (суха)", category: "GRAINS", caloriesPer100: 343, proteinPer100: 13, fatPer100: 3.4, carbsPer100: 72 },
  { name: "Макарони (сухі)", category: "GRAINS", caloriesPer100: 371, proteinPer100: 13, fatPer100: 1.5, carbsPer100: 75 },
  { name: "Цільнозерновий хліб", category: "GRAINS", caloriesPer100: 247, proteinPer100: 13, fatPer100: 3.4, carbsPer100: 41 },
  { name: "Картопля", category: "VEGETABLES", caloriesPer100: 77, proteinPer100: 2, fatPer100: 0.1, carbsPer100: 17 },
  { name: "Броколі", category: "VEGETABLES", caloriesPer100: 34, proteinPer100: 2.8, fatPer100: 0.4, carbsPer100: 7 },
  { name: "Огірок", category: "VEGETABLES", caloriesPer100: 15, proteinPer100: 0.7, fatPer100: 0.1, carbsPer100: 3.6 },
  { name: "Помідор", category: "VEGETABLES", caloriesPer100: 18, proteinPer100: 0.9, fatPer100: 0.2, carbsPer100: 3.9 },
  { name: "Банан", category: "FRUITS", caloriesPer100: 89, proteinPer100: 1.1, fatPer100: 0.3, carbsPer100: 23 },
  { name: "Яблуко", category: "FRUITS", caloriesPer100: 52, proteinPer100: 0.3, fatPer100: 0.2, carbsPer100: 14 },
  { name: "Полуниця", category: "FRUITS", caloriesPer100: 32, proteinPer100: 0.7, fatPer100: 0.3, carbsPer100: 7.7 },
  { name: "Мигдаль", category: "NUTS", caloriesPer100: 579, proteinPer100: 21, fatPer100: 50, carbsPer100: 22 },
  { name: "Арахісова паста", category: "NUTS", caloriesPer100: 588, proteinPer100: 25, fatPer100: 50, carbsPer100: 20 },
  { name: "Оливкова олія", category: "OILS", caloriesPer100: 884, proteinPer100: 0, fatPer100: 100, carbsPer100: 0 },
  { name: "Мед", category: "SWEETS", caloriesPer100: 304, proteinPer100: 0.3, fatPer100: 0, carbsPer100: 82 },
  { name: "Шоколад темний 70%", category: "SWEETS", caloriesPer100: 598, proteinPer100: 7.8, fatPer100: 43, carbsPer100: 46 },
  { name: "Протеїн (сироватковий)", category: "OTHER", caloriesPer100: 400, proteinPer100: 80, fatPer100: 5, carbsPer100: 8 },
  { name: "Кава (без цукру)", category: "DRINKS", caloriesPer100: 2, proteinPer100: 0.1, fatPer100: 0, carbsPer100: 0 },
];
