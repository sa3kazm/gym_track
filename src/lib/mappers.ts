import type { WorkoutPlan, WorkoutSession } from "@prisma/client";
import {
  parseExercises,
  parseSchedule,
} from "@/lib/validations";
import type { WorkoutPlanDto, WorkoutSessionDto } from "@/types";

export function toWorkoutPlanDto(plan: WorkoutPlan): WorkoutPlanDto {
  return {
    ...plan,
    schedule: parseSchedule(plan.schedule),
  };
}

export function toWorkoutSessionDto(
  session: WorkoutSession
): WorkoutSessionDto {
  return {
    ...session,
    exercises: parseExercises(session.exercises),
  };
}
