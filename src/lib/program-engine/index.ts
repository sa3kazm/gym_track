import type { Exercise } from "@prisma/client";
import { buildIdMapFromDb } from "./exercise-picker";
import { generateMonthlyProgram } from "./calendar-builder";
import type { MonthlyProgram, ProgramGenerationInput } from "./types";

export * from "./types";
export * from "./split-selector";
export * from "./exercise-catalog";
export * from "./params-generator";
export { generateMonthlyProgram };

export function generateProgram(
  input: ProgramGenerationInput,
  dbExercises: Exercise[]
): MonthlyProgram {
  const idMap = buildIdMapFromDb(
    dbExercises.map((e) => ({ id: e.id, name: e.name }))
  );

  if (idMap.size === 0) {
    throw new Error("Бібліотека вправ порожня. Запустіть db:seed.");
  }

  return generateMonthlyProgram(input, idMap);
}
