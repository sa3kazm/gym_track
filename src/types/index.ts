import type {
  ActivityLevel,
  BodyMetrics,
  Equipment,
  Exercise,
  ExerciseCategory,
  Gender,
  Goal,
  Profile,
  TrainingPreferences,
  WeightUnit,
  WorkoutPlan,
  WorkoutSession,
} from "@prisma/client";
import type { WorkoutPlanSchedule } from "@/lib/validations/workout-plan";
import type { WorkoutSessionExercises } from "@/lib/validations/workout-session";

export type {
  Profile,
  BodyMetrics,
  TrainingPreferences,
  Exercise,
  WorkoutPlan,
  WorkoutSession,
  Gender,
  Goal,
  ActivityLevel,
  ExerciseCategory,
  Equipment,
  WeightUnit,
};

/** Профіль з пов’язаними налаштуваннями */
export interface ProfileWithPreferences extends Profile {
  trainingPreferences: TrainingPreferences | null;
}

/** План з розпарсеним schedule */
export interface WorkoutPlanDto extends Omit<WorkoutPlan, "schedule"> {
  schedule: WorkoutPlanSchedule;
}

/** Сесія з розпарсеними вправами */
export interface WorkoutSessionDto extends Omit<WorkoutSession, "exercises"> {
  exercises: WorkoutSessionExercises;
}

/** Відповідь API */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
