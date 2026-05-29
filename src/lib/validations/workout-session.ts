import { z } from "zod";

export const workoutSetSchema = z.object({
  weightKg: z.number().min(0).max(1000),
  reps: z.number().int().min(0).max(500),
  bodyWeightKg: z.number().min(0).max(500).optional(),
  completedAt: z.string().datetime().optional(),
});

export const workoutSessionExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  sets: z.array(workoutSetSchema).default([]),
});

export const workoutSessionExercisesSchema = z.array(
  workoutSessionExerciseSchema
);

export const createWorkoutSessionSchema = z.object({
  profileId: z.string().cuid().optional(),
  workoutPlanId: z.string().cuid().nullable().optional(),
  planDayId: z.string().nullable().optional(),
  sessionDate: z.coerce.date().optional(),
  startedAt: z.coerce.date().optional(),
  exercises: workoutSessionExercisesSchema.optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export const updateWorkoutSessionSchema = z.object({
  workoutPlanId: z.string().cuid().nullable().optional(),
  planDayId: z.string().nullable().optional(),
  sessionDate: z.coerce.date().optional(),
  endedAt: z.coerce.date().nullable().optional(),
  totalVolume: z.number().min(0).optional(),
  exercises: workoutSessionExercisesSchema.optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export type WorkoutSessionExercises = z.infer<
  typeof workoutSessionExercisesSchema
>;
export type CreateWorkoutSessionInput = z.infer<
  typeof createWorkoutSessionSchema
>;
export type UpdateWorkoutSessionInput = z.infer<
  typeof updateWorkoutSessionSchema
>;

export function serializeExercises(exercises: WorkoutSessionExercises): string {
  return JSON.stringify(exercises);
}

export function parseExercises(raw: string): WorkoutSessionExercises {
  const parsed = JSON.parse(raw) as unknown;
  return workoutSessionExercisesSchema.parse(parsed);
}

export function computeTotalVolume(
  exercises: WorkoutSessionExercises
): number {
  return exercises.reduce((sessionTotal, ex) => {
    const exTotal = ex.sets.reduce(
      (sum, set) => sum + set.weightKg * set.reps,
      0
    );
    return sessionTotal + exTotal;
  }, 0);
}
