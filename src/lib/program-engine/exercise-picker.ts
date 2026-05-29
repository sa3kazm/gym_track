import type { ExerciseCategory } from "@prisma/client";
import {
  EXERCISE_CATALOG,
  isExerciseAllowed,
} from "./exercise-catalog";
import type {
  CatalogExercise,
  ProgramGenerationInput,
  SessionFocus,
} from "./types";

const FOCUS_POOLS: Record<SessionFocus, ExerciseCategory[]> = {
  FULL: ["CHEST", "BACK", "LEGS", "SHOULDERS", "ARMS", "CORE"],
  PUSH: ["CHEST", "SHOULDERS", "ARMS"],
  PULL: ["BACK", "ARMS"],
  LEGS: ["LEGS", "CORE"],
  UPPER: ["CHEST", "BACK", "SHOULDERS", "ARMS"],
  LOWER: ["LEGS", "CORE"],
};

function exerciseCount(
  focus: SessionFocus,
  experience: ProgramGenerationInput["experienceLevel"]
): number {
  const base: Record<SessionFocus, number> = {
    FULL: 6,
    PUSH: 5,
    PULL: 5,
    LEGS: 5,
    UPPER: 6,
    LOWER: 5,
  };
  const n = base[focus];
  if (experience === "BEGINNER") return Math.max(4, n - 1);
  if (experience === "ADVANCED") return n + 1;
  return n;
}

function scoreExercise(
  ex: CatalogExercise,
  input: ProgramGenerationInput,
  focus: SessionFocus,
  pickedCategories: Set<ExerciseCategory>
): number {
  if (!input.availableEquipment.includes(ex.equipment)) return -1;
  if (!isExerciseAllowed(ex, input.injuries)) return -1;
  if (!FOCUS_POOLS[focus].includes(ex.category)) return -1;

  let score = ex.priority;
  if (input.priorityMuscles.includes(ex.category)) score += 15;
  if (ex.compound && pickedCategories.size < 3) score += 5;
  if (pickedCategories.has(ex.category) && !ex.compound) score -= 3;
  return score;
}

export function pickExercisesForSession(
  focus: SessionFocus,
  input: ProgramGenerationInput,
  idMap: Map<string, string>
): CatalogExercise[] {
  const count = exerciseCount(focus, input.experienceLevel);
  const picked: CatalogExercise[] = [];
  const pickedCategories = new Set<ExerciseCategory>();
  const usedSlugs = new Set<string>();

  const pool = EXERCISE_CATALOG.filter((ex) => idMap.has(ex.slug));

  while (picked.length < count) {
    let best: CatalogExercise | null = null;
    let bestScore = -1;

    for (const ex of pool) {
      if (usedSlugs.has(ex.slug)) continue;
      const compounds = picked.filter((p) => p.compound).length;
      if (ex.compound && compounds >= 2 && focus !== "FULL") continue;

      const s = scoreExercise(ex, input, focus, pickedCategories);
      if (s > bestScore) {
        bestScore = s;
        best = ex;
      }
    }

    if (!best) break;
    picked.push(best);
    pickedCategories.add(best.category);
    usedSlugs.add(best.slug);
  }

  return picked;
}

export function buildIdMapFromDb(
  dbExercises: { id: string; name: string }[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const cat of EXERCISE_CATALOG) {
    const db = dbExercises.find((d) => d.name === cat.name);
    if (db) map.set(cat.slug, db.id);
  }
  return map;
}
