import { z } from "zod";

export const createBodyMetricsSchema = z.object({
  profileId: z.string().cuid().optional(),
  recordedAt: z.coerce.date().optional(),
  weightKg: z.number().min(20).max(500),
  bodyFatPercent: z.number().min(0).max(100).nullable().optional(),
  note: z.string().max(500).nullable().optional(),
});

export const updateBodyMetricsSchema = z.object({
  recordedAt: z.coerce.date().optional(),
  weightKg: z.number().min(20).max(500).optional(),
  bodyFatPercent: z.number().min(0).max(100).nullable().optional(),
  note: z.string().max(500).nullable().optional(),
});

export type CreateBodyMetricsInput = z.infer<typeof createBodyMetricsSchema>;
export type UpdateBodyMetricsInput = z.infer<typeof updateBodyMetricsSchema>;
