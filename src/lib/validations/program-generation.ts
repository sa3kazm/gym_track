import { z } from "zod";
import { goalSchema } from "./enums";

export const injuryFlagSchema = z.enum([
  "LOWER_BACK",
  "SHOULDER",
  "KNEE",
  "WRIST",
  "ELBOW",
  "HIP",
]);

export const splitTypeSchema = z.enum([
  "FULL_BODY",
  "UPPER_LOWER",
  "PPL",
  "AUTO",
]);

export const experienceLevelSchema = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
]);

export const equipmentSchema = z.enum([
  "BARBELL",
  "DUMBBELL",
  "CABLE",
  "MACHINE",
  "BODYWEIGHT",
  "OTHER",
]);

export const generateProgramSchema = z.object({
  daysPerWeek: z.coerce.number().int().min(1).max(6),
  goal: goalSchema.optional(),
  experienceLevel: experienceLevelSchema.optional().default("INTERMEDIATE"),
  availableEquipment: z.array(equipmentSchema).min(1),
  injuries: z.array(injuryFlagSchema).optional().default([]),
  priorityMuscles: z
    .array(
      z.enum([
        "CHEST",
        "BACK",
        "LEGS",
        "SHOULDERS",
        "ARMS",
        "CORE",
        "OTHER",
      ])
    )
    .optional()
    .default([]),
  preferredSplit: splitTypeSchema.optional().default("AUTO"),
  weeks: z.coerce.number().int().min(1).max(12).optional().default(4),
  restSeconds: z.coerce.number().int().min(30).max(300).optional(),
  useWeakZones: z.boolean().optional().default(true),
});

export type GenerateProgramPayload = z.infer<typeof generateProgramSchema>;

export const monthlyProgramSchema = z.object({
  version: z.literal(2),
  splitType: z.enum(["FULL_BODY", "UPPER_LOWER", "PPL"]),
  daysPerWeek: z.number(),
  weeks: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  goal: goalSchema,
  experienceLevel: experienceLevelSchema,
  sessions: z.array(z.any()),
  summary: z.object({
    totalSessions: z.number(),
    sessionsPerWeek: z.number(),
    priorityMuscles: z.array(z.string()),
  }),
});
