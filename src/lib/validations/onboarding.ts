import { z } from "zod";
import {
  activityLevelSchema,
  genderSchema,
  goalSchema,
  weightUnitSchema,
} from "./enums";

/** Повна форма онбордингу */
export const onboardingFormSchema = z.object({
  name: z.string().min(1, "Введіть ім'я").max(120),
  age: z.coerce.number().int("Вкажіть вік").min(10).max(120),
  gender: genderSchema,
  heightCm: z.coerce.number().min(100, "Мін. 100 см").max(250, "Макс. 250 см"),
  currentWeightKg: z.coerce
    .number()
    .min(30, "Мін. 30 кг")
    .max(300, "Макс. 300 кг"),
  targetWeightKg: z.coerce
    .number()
    .min(30, "Мін. 30 кг")
    .max(300, "Макс. 300 кг"),
  goal: goalSchema,
  activityLevel: activityLevelSchema,
  preferredSplit: z.string().max(80).optional().default(""),
  defaultRestSeconds: z.coerce.number().int().min(30).max(300),
  weightUnit: weightUnitSchema,
  dailyCalories: z.coerce.number().int().min(500).max(10000),
  dailyProteinG: z.coerce.number().int().min(0).max(1000),
  dailyFatG: z.coerce.number().int().min(0).max(1000),
  dailyCarbsG: z.coerce.number().int().min(0).max(2000),
  dailyWaterMl: z.coerce.number().int().min(0).max(10000),
});

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;

/** Валідація окремого кроку */
export const onboardingStepSchemas = [
  onboardingFormSchema.pick({ name: true }),
  onboardingFormSchema.pick({ age: true, gender: true, heightCm: true }),
  onboardingFormSchema.pick({
    currentWeightKg: true,
    targetWeightKg: true,
    goal: true,
  }),
  onboardingFormSchema.pick({ activityLevel: true }),
  onboardingFormSchema.pick({
    preferredSplit: true,
    defaultRestSeconds: true,
    weightUnit: true,
  }),
  onboardingFormSchema.pick({
    dailyCalories: true,
    dailyProteinG: true,
    dailyFatG: true,
    dailyCarbsG: true,
    dailyWaterMl: true,
  }),
] as const;

export type OnboardingStepIndex = 0 | 1 | 2 | 3 | 4 | 5;

export const ONBOARDING_STEP_FIELDS: (keyof OnboardingFormValues)[][] = [
  ["name"],
  ["age", "gender", "heightCm"],
  ["currentWeightKg", "targetWeightKg", "goal"],
  ["activityLevel"],
  ["preferredSplit", "defaultRestSeconds", "weightUnit"],
  [
    "dailyCalories",
    "dailyProteinG",
    "dailyFatG",
    "dailyCarbsG",
    "dailyWaterMl",
  ],
];

export const defaultOnboardingValues: OnboardingFormValues = {
  name: "",
  age: 25,
  gender: "MALE",
  heightCm: 175,
  currentWeightKg: 75,
  targetWeightKg: 70,
  goal: "LOSS",
  activityLevel: "MODERATE",
  preferredSplit: "PPL",
  defaultRestSeconds: 90,
  weightUnit: "KG",
  dailyCalories: 2200,
  dailyProteinG: 150,
  dailyFatG: 65,
  dailyCarbsG: 220,
  dailyWaterMl: 2500,
};

/** Орієнтовні норми КБЖУ за профілем (спрощена формула) */
export function estimateMacros(values: Pick<
  OnboardingFormValues,
  "age" | "gender" | "heightCm" | "currentWeightKg" | "activityLevel" | "goal"
>): Pick<
  OnboardingFormValues,
  "dailyCalories" | "dailyProteinG" | "dailyFatG" | "dailyCarbsG" | "dailyWaterMl"
> {
  const weight = values.currentWeightKg;
  const bmr =
    values.gender === "MALE"
      ? 10 * weight + 6.25 * values.heightCm - 5 * values.age + 5
      : 10 * weight + 6.25 * values.heightCm - 5 * values.age - 161;

  const activityMultiplier: Record<string, number> = {
    SEDENTARY: 1.2,
    LIGHT: 1.375,
    MODERATE: 1.55,
    ACTIVE: 1.725,
    VERY_ACTIVE: 1.9,
  };

  let calories = Math.round(
    bmr * (activityMultiplier[values.activityLevel] ?? 1.55)
  );

  if (values.goal === "LOSS") calories -= 400;
  if (values.goal === "GAIN") calories += 300;

  const protein = Math.round(weight * 2);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  return {
    dailyCalories: Math.max(1200, calories),
    dailyProteinG: protein,
    dailyFatG: fat,
    dailyCarbsG: Math.max(0, carbs),
    dailyWaterMl: Math.round(weight * 35),
  };
}
