import { z } from "zod";
import { weightUnitSchema } from "./enums";

export const updateTrainingPreferencesSchema = z.object({
  defaultRestSeconds: z.number().int().min(0).max(600).optional(),
  preferredSplit: z.string().max(80).nullable().optional(),
  weightUnit: weightUnitSchema.optional(),
  dailyCalories: z.number().int().min(500).max(10000).optional(),
  dailyProteinG: z.number().int().min(0).max(1000).optional(),
  dailyFatG: z.number().int().min(0).max(1000).optional(),
  dailyCarbsG: z.number().int().min(0).max(2000).optional(),
  dailyWaterMl: z.number().int().min(0).max(10000).optional(),
});

export type UpdateTrainingPreferencesInput = z.infer<
  typeof updateTrainingPreferencesSchema
>;
