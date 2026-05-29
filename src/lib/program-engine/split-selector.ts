import type { SplitType } from "./types";

const SPLIT_LABELS: Record<SplitType, string> = {
  FULL_BODY: "Full Body",
  UPPER_LOWER: "Upper / Lower",
  PPL: "Push / Pull / Legs",
};

export function getSplitLabel(split: SplitType): string {
  return SPLIT_LABELS[split];
}

/** Рекомендований спліт за кількістю днів на тиждень */
export function selectSplit(
  daysPerWeek: number,
  preferred?: SplitType | "AUTO"
): SplitType {
  const days = Math.max(1, Math.min(6, daysPerWeek));

  if (preferred && preferred !== "AUTO") {
    if (isSplitCompatible(preferred, days)) return preferred;
  }

  if (days <= 3) return "FULL_BODY";
  if (days === 4) return "UPPER_LOWER";
  return "PPL";
}

export function isSplitCompatible(split: SplitType, daysPerWeek: number): boolean {
  const min: Record<SplitType, number> = {
    FULL_BODY: 1,
    UPPER_LOWER: 4,
    PPL: 3,
  };
  const max: Record<SplitType, number> = {
    FULL_BODY: 3,
    UPPER_LOWER: 6,
    PPL: 6,
  };
  return daysPerWeek >= min[split] && daysPerWeek <= max[split];
}

export interface WeekTemplateSlot {
  focus: import("./types").SessionFocus;
  label: string;
  targetMuscles: import("@prisma/client").ExerciseCategory[];
}

/** Шаблон одного тижня (порядок тренувань) */
export function buildWeekTemplate(
  split: SplitType,
  daysPerWeek: number
): WeekTemplateSlot[] {
  const days = Math.max(1, Math.min(6, daysPerWeek));

  switch (split) {
    case "FULL_BODY":
      return Array.from({ length: days }, (_, i) => ({
        focus: "FULL" as const,
        label: `Full Body ${String.fromCharCode(65 + i)}`,
        targetMuscles: [
          "CHEST",
          "BACK",
          "LEGS",
          "SHOULDERS",
        ] as import("@prisma/client").ExerciseCategory[],
      }));

    case "UPPER_LOWER": {
      const pattern: WeekTemplateSlot[] = [
        {
          focus: "UPPER",
          label: "Upper A",
          targetMuscles: ["CHEST", "BACK", "SHOULDERS", "ARMS"],
        },
        {
          focus: "LOWER",
          label: "Lower A",
          targetMuscles: ["LEGS", "CORE"],
        },
        {
          focus: "UPPER",
          label: "Upper B",
          targetMuscles: ["CHEST", "BACK", "SHOULDERS", "ARMS"],
        },
        {
          focus: "LOWER",
          label: "Lower B",
          targetMuscles: ["LEGS", "CORE"],
        },
      ];
      return pattern.slice(0, days);
    }

    case "PPL": {
      const cycle: WeekTemplateSlot[] = [
        {
          focus: "PUSH",
          label: "Push",
          targetMuscles: ["CHEST", "SHOULDERS", "ARMS"],
        },
        {
          focus: "PULL",
          label: "Pull",
          targetMuscles: ["BACK", "ARMS"],
        },
        {
          focus: "LEGS",
          label: "Legs",
          targetMuscles: ["LEGS", "CORE"],
        },
      ];
      const result: WeekTemplateSlot[] = [];
      for (let i = 0; i < days; i++) {
        const slot = cycle[i % 3];
        const suffix =
          Math.floor(i / 3) > 0
            ? ` ${String.fromCharCode(65 + Math.floor(i / 3))}`
            : "";
        result.push({
          ...slot,
          label: `${slot.label}${suffix}`.trim(),
        });
      }
      return result;
    }
  }
}

/** Дні тижня (1=Пн … 7=Нд) для розкладу */
export function distributeWeekdays(daysPerWeek: number): number[] {
  const presets: Record<number, number[]> = {
    1: [3],
    2: [2, 5],
    3: [1, 3, 5],
    4: [1, 2, 4, 5],
    5: [1, 2, 3, 5, 6],
    6: [1, 2, 3, 4, 5, 6],
  };
  return presets[daysPerWeek] ?? presets[3];
}
