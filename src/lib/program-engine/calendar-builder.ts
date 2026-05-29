import type { ExerciseCategory } from "@prisma/client";
import { addDays, format, startOfWeek } from "./date-utils";
import { pickExercisesForSession } from "./exercise-picker";
import { prescribeExercise } from "./params-generator";
import {
  buildWeekTemplate,
  distributeWeekdays,
  selectSplit,
} from "./split-selector";
import type {
  CatalogExercise,
  GeneratedWorkoutSession,
  MonthlyProgram,
  ProgramGenerationInput,
} from "./types";

function sessionId(week: number, index: number): string {
  return `sess_w${week}_${index}`;
}

function estimateMinutes(exerciseCount: number, totalSets: number): number {
  return Math.round(exerciseCount * 4 + totalSets * 2.5 + 10);
}

export function generateMonthlyProgram(
  input: ProgramGenerationInput,
  idMap: Map<string, string>
): MonthlyProgram {
  const weeks = input.weeks ?? 4;
  const restSeconds = input.restSeconds ?? 90;
  const start = input.startDate ?? new Date();
  const startDate = startOfWeek(start, { weekStartsOn: 1 });

  const splitType = selectSplit(input.daysPerWeek, input.preferredSplit);
  const weekTemplate = buildWeekTemplate(splitType, input.daysPerWeek);
  const weekdays = distributeWeekdays(input.daysPerWeek);

  const sessions: GeneratedWorkoutSession[] = [];
  let sessionIndex = 0;

  for (let week = 1; week <= weeks; week++) {
    weekTemplate.forEach((slot, dayIdx) => {
      const dayOfWeek = weekdays[dayIdx] ?? dayIdx + 1;
      const date = addDays(startDate, (week - 1) * 7 + (dayOfWeek - 1));

      const catalogExercises = pickExercisesForSession(
        slot.focus,
        input,
        idMap
      ).filter((ex) => idMap.has(ex.slug));

      const exercises = catalogExercises
        .map((ex: CatalogExercise) => {
          const exerciseId = idMap.get(ex.slug)!;
          return prescribeExercise(
            ex,
            exerciseId,
            input.goal,
            input.experienceLevel,
            weeks,
            restSeconds,
            week
          );
        });

      const totalSets = exercises.reduce((s, e) => s + e.sets, 0);

      sessions.push({
        id: sessionId(week, sessionIndex++),
        weekNumber: week,
        dayOfWeek,
        date: format(date, "yyyy-MM-dd"),
        label: `Тиждень ${week} · ${slot.label}`,
        focus: slot.focus,
        targetMuscles: slot.targetMuscles as ExerciseCategory[],
        exercises,
        estimatedMinutes: estimateMinutes(exercises.length, totalSets),
        completed: false,
      });
    });
  }

  const endDate = sessions[sessions.length - 1]?.date ?? format(startDate, "yyyy-MM-dd");

  return {
    version: 2,
    splitType,
    daysPerWeek: input.daysPerWeek,
    weeks,
    startDate: format(startDate, "yyyy-MM-dd"),
    endDate,
    goal: input.goal,
    experienceLevel: input.experienceLevel,
    sessions,
    summary: {
      totalSessions: sessions.length,
      sessionsPerWeek: input.daysPerWeek,
      priorityMuscles: input.priorityMuscles,
    },
  };
}
