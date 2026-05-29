import { z } from "zod";
import type { MonthlyProgram } from "@/lib/program-engine";

export const generatedExerciseSchema = z.object({
  exerciseId: z.string(),
  slug: z.string(),
  name: z.string(),
  category: z.string(),
  sets: z.number(),
  reps: z.string(),
  rpe: z.number(),
  restSeconds: z.number(),
  progression: z.array(
    z.object({
      week: z.number(),
      sets: z.number(),
      reps: z.string(),
      rpe: z.number(),
      loadNote: z.string(),
    })
  ),
  notes: z.string(),
});

export const generatedSessionSchema = z.object({
  id: z.string(),
  weekNumber: z.number(),
  dayOfWeek: z.number(),
  date: z.string(),
  label: z.string(),
  focus: z.string(),
  targetMuscles: z.array(z.string()),
  exercises: z.array(generatedExerciseSchema),
  estimatedMinutes: z.number(),
  completed: z.boolean().optional(),
});

export const programScheduleV2Schema = z.object({
  version: z.literal(2),
  splitType: z.enum(["FULL_BODY", "UPPER_LOWER", "PPL"]),
  daysPerWeek: z.number(),
  weeks: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  goal: z.string(),
  experienceLevel: z.string(),
  sessions: z.array(generatedSessionSchema),
  summary: z.object({
    totalSessions: z.number(),
    sessionsPerWeek: z.number(),
    priorityMuscles: z.array(z.string()),
  }),
});

export type ProgramScheduleV2 = z.infer<typeof programScheduleV2Schema>;

export function serializeProgram(program: MonthlyProgram): string {
  return JSON.stringify(program);
}

export function parseProgram(raw: string): MonthlyProgram {
  const parsed = JSON.parse(raw) as unknown;
  return programScheduleV2Schema.parse(parsed) as MonthlyProgram;
}

export function isProgramV2(raw: string): boolean {
  try {
    const p = JSON.parse(raw) as { version?: number };
    return p.version === 2;
  } catch {
    return false;
  }
}
