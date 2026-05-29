import type { Goal } from "@prisma/client";
import type {
  CatalogExercise,
  ExperienceLevel,
  GeneratedExercisePrescription,
  WeekProgression,
} from "./types";

interface ParamTemplate {
  sets: number;
  reps: string;
  rpe: number;
}

function baseTemplate(
  goal: Goal,
  experience: ExperienceLevel,
  compound: boolean
): ParamTemplate {
  const expMod =
    experience === "BEGINNER"
      ? { sets: -1, rpe: -1 }
      : experience === "ADVANCED"
        ? { sets: 1, rpe: 0.5 }
        : { sets: 0, rpe: 0 };

  const templates: Record<Goal, ParamTemplate> = {
    LOSS: {
      sets: compound ? 3 : 3,
      reps: compound ? "10-12" : "12-15",
      rpe: 7,
    },
    GAIN: {
      sets: compound ? 4 : 3,
      reps: compound ? "6-8" : "8-12",
      rpe: 8,
    },
    MAINTAIN: {
      sets: compound ? 3 : 3,
      reps: compound ? "8-10" : "10-12",
      rpe: 7.5,
    },
  };

  const t = templates[goal];
  return {
    sets: Math.max(2, t.sets + expMod.sets),
    reps: t.reps,
    rpe: Math.min(9.5, t.rpe + expMod.rpe),
  };
}

function buildProgression(
  base: ParamTemplate,
  weeks: number,
  compound: boolean
): WeekProgression[] {
  const progression: WeekProgression[] = [];

  for (let w = 1; w <= weeks; w++) {
    let sets = base.sets;
    let reps = base.reps;
    let rpe = base.rpe;
    let loadNote = "Базове навантаження";

    if (w === 2) {
      loadNote = compound
        ? "Додайте 2.5–5 кг на базових вправах"
        : "+1–2 повтори в останньому підході";
      rpe = Math.min(9, base.rpe + 0.5);
    } else if (w === 3) {
      sets = compound ? base.sets + 1 : base.sets;
      loadNote = compound
        ? "Додатковий підхід або +2.5 кг (progressive overload)"
        : "Збільште вагу на 5%";
      rpe = Math.min(9, base.rpe + 1);
    } else if (w === 4 && weeks >= 4) {
      sets = Math.max(2, base.sets - 1);
      reps = compound ? "8-10" : "10-12";
      rpe = Math.max(6, base.rpe - 1.5);
      loadNote = "Deload тиждень: −10% обсягу, техніка";
    } else if (w > 4) {
      const cycle = (w - 1) % 3;
      if (cycle === 0) loadNote = "Новий цикл: +2.5 кг на компаундах";
      else if (cycle === 1) loadNote = "+1 повтор у цільовому діапазоні";
      else loadNote = "Пік тижня: RPE 8–9";
    }

    progression.push({
      week: w,
      sets,
      reps,
      rpe: Math.round(rpe * 10) / 10,
      loadNote,
    });
  }

  return progression;
}

export function prescribeExercise(
  ex: CatalogExercise,
  exerciseId: string,
  goal: Goal,
  experience: ExperienceLevel,
  weeks: number,
  restSeconds: number,
  weekNumber: number
): GeneratedExercisePrescription {
  const base = baseTemplate(goal, experience, ex.compound);
  const progression = buildProgression(base, weeks, ex.compound);
  const weekPlan = progression[weekNumber - 1] ?? progression[0];

  return {
    exerciseId,
    slug: ex.slug,
    name: ex.name,
    category: ex.category,
    sets: weekPlan.sets,
    reps: weekPlan.reps,
    rpe: weekPlan.rpe,
    restSeconds: ex.compound ? restSeconds + 30 : restSeconds,
    progression,
    notes: weekPlan.loadNote,
  };
}
