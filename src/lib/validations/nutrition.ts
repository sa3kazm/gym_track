import { z } from "zod";

export const mealTypeSchema = z.enum([
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACKS",
]);

export const foodCategorySchema = z.enum([
  "MEAT",
  "FISH",
  "DAIRY",
  "GRAINS",
  "VEGETABLES",
  "FRUITS",
  "NUTS",
  "OILS",
  "SWEETS",
  "DRINKS",
  "OTHER",
]);

export const createFoodSchema = z.object({
  name: z.string().min(1).max(120),
  category: foodCategorySchema.optional().default("OTHER"),
  caloriesPer100: z.coerce.number().min(0).max(1000),
  proteinPer100: z.coerce.number().min(0).max(100),
  fatPer100: z.coerce.number().min(0).max(100),
  carbsPer100: z.coerce.number().min(0).max(100),
});

export const createNutritionEntrySchema = z.object({
  foodId: z.string().cuid(),
  grams: z.coerce.number().min(1).max(5000),
  mealType: mealTypeSchema,
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type CreateFoodInput = z.infer<typeof createFoodSchema>;
export type CreateNutritionEntryInput = z.infer<
  typeof createNutritionEntrySchema
>;
