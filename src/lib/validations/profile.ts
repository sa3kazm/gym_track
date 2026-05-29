import { z } from "zod";
import {
  activityLevelSchema,
  genderSchema,
  goalSchema,
} from "./enums";

export const createProfileSchema = z.object({
  name: z.string().max(120).optional().default(""),
  age: z.number().int().min(10).max(120).nullable().optional(),
  gender: genderSchema.optional(),
  heightCm: z.number().min(100).max(250).nullable().optional(),
  targetWeightKg: z.number().min(30).max(300).nullable().optional(),
  goal: goalSchema.optional(),
  activityLevel: activityLevelSchema.optional(),
});

export const updateProfileSchema = createProfileSchema.partial();

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
