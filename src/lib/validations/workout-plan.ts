import { z } from "zod";

export const workoutPlanDayExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  sets: z.number().int().min(1).max(20).default(3),
  targetReps: z.string().max(20).default("8-12"),
  restSeconds: z.number().int().min(0).max(600).default(90),
  notes: z.string().max(300).optional().default(""),
});

export const workoutPlanDaySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  exercises: z.array(workoutPlanDayExerciseSchema).default([]),
});

export const workoutPlanScheduleSchema = z.object({
  days: z.array(workoutPlanDaySchema).default([]),
});

export const createWorkoutPlanSchema = z.object({
  profileId: z.string().cuid().optional(),
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  schedule: workoutPlanScheduleSchema.optional(),
});

export const updateWorkoutPlanSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).nullable().optional(),
  schedule: workoutPlanScheduleSchema.optional(),
});

export type WorkoutPlanSchedule = z.infer<typeof workoutPlanScheduleSchema>;
export type CreateWorkoutPlanInput = z.infer<typeof createWorkoutPlanSchema>;
export type UpdateWorkoutPlanInput = z.infer<typeof updateWorkoutPlanSchema>;

export function serializeSchedule(schedule: WorkoutPlanSchedule): string {
  return JSON.stringify(schedule);
}

export function parseSchedule(raw: string): WorkoutPlanSchedule {
  const parsed = JSON.parse(raw) as unknown;
  return workoutPlanScheduleSchema.parse(parsed);
}
