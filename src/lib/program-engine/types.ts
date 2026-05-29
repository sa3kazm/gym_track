import type { Equipment, ExerciseCategory, Goal } from "@prisma/client";

export type SplitType = "FULL_BODY" | "UPPER_LOWER" | "PPL";

export type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type InjuryFlag =
  | "LOWER_BACK"
  | "SHOULDER"
  | "KNEE"
  | "WRIST"
  | "ELBOW"
  | "HIP";

export type SessionFocus =
  | "FULL"
  | "PUSH"
  | "PULL"
  | "LEGS"
  | "UPPER"
  | "LOWER";

export interface CatalogExercise {
  slug: string;
  name: string;
  category: ExerciseCategory;
  equipment: Equipment;
  compound: boolean;
  avoidInjuries: InjuryFlag[];
  /** Пріоритет для слабких зон (вище = частіше) */
  priority: number;
}

export interface ProgramGenerationInput {
  daysPerWeek: number;
  goal: Goal;
  experienceLevel: ExperienceLevel;
  availableEquipment: Equipment[];
  injuries: InjuryFlag[];
  priorityMuscles: ExerciseCategory[];
  preferredSplit?: SplitType | "AUTO";
  weeks?: number;
  restSeconds?: number;
  startDate?: Date;
}

export interface WeekProgression {
  week: number;
  sets: number;
  reps: string;
  rpe: number;
  loadNote: string;
}

export interface GeneratedExercisePrescription {
  exerciseId: string;
  slug: string;
  name: string;
  category: ExerciseCategory;
  sets: number;
  reps: string;
  rpe: number;
  restSeconds: number;
  progression: WeekProgression[];
  notes: string;
}

export interface LoggedSet {
  weightKg: number;
  reps: number;
}

export interface GeneratedWorkoutSession {
  id: string;
  weekNumber: number;
  dayOfWeek: number;
  date: string;
  label: string;
  focus: SessionFocus;
  targetMuscles: ExerciseCategory[];
  exercises: GeneratedExercisePrescription[];
  estimatedMinutes: number;
  completed?: boolean;
  /** ID запису в WorkoutSession (Prisma) */
  workoutLogId?: string;
  totalVolumeLogged?: number;
  completedAt?: string;
}

export interface MonthlyProgram {
  version: 2;
  splitType: SplitType;
  daysPerWeek: number;
  weeks: number;
  startDate: string;
  endDate: string;
  goal: Goal;
  experienceLevel: ExperienceLevel;
  sessions: GeneratedWorkoutSession[];
  summary: {
    totalSessions: number;
    sessionsPerWeek: number;
    priorityMuscles: ExerciseCategory[];
  };
}
