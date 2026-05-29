import { z } from "zod";
import { workoutSetSchema } from "./workout-session";

export const exerciseLogSchema = z.object({
  exerciseId: z.string().min(1),
  sets: z.array(workoutSetSchema).min(1),
});

export const completeProgramSessionSchema = z.object({
  completed: z.boolean(),
  logs: z.array(exerciseLogSchema).optional(),
  notes: z.string().max(1000).optional(),
});

export const updatePrescriptionExerciseSchema = z.object({
  sets: z.number().int().min(1).max(20).optional(),
  reps: z.string().max(20).optional(),
  rpe: z.number().min(5).max(10).optional(),
  restSeconds: z.number().int().min(0).max(600).optional(),
  notes: z.string().max(300).optional(),
  replaceExerciseId: z.string().min(1).optional(),
});

export const updateSessionExercisesSchema = z.object({
  exercises: z.array(
    z.object({
      exerciseId: z.string(),
      slug: z.string(),
      name: z.string(),
      category: z.string(),
      sets: z.number(),
      reps: z.string(),
      rpe: z.number(),
      restSeconds: z.number(),
      notes: z.string(),
      progression: z.array(z.any()).optional(),
    })
  ),
});

export type CompleteProgramSessionPayload = z.infer<
  typeof completeProgramSessionSchema
>;
export type UpdatePrescriptionExercisePayload = z.infer<
  typeof updatePrescriptionExerciseSchema
>;
