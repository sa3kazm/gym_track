import { z } from "zod";
import { equipmentSchema, exerciseCategorySchema } from "./enums";

export const createExerciseSchema = z.object({
  profileId: z.string().cuid().nullable().optional(),
  name: z.string().min(1).max(120),
  category: exerciseCategorySchema.optional(),
  equipment: equipmentSchema.optional(),
  isCustom: z.boolean().optional(),
});

export const updateExerciseSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  category: exerciseCategorySchema.optional(),
  equipment: equipmentSchema.optional(),
});

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
