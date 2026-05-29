"use client";

import { useFormContext } from "react-hook-form";
import { Sparkles, Calculator } from "lucide-react";
import type { OnboardingFormValues } from "@/lib/validations/onboarding";
import { estimateMacros } from "@/lib/validations/onboarding";
import {
  ACTIVITY_OPTIONS,
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  SPLIT_OPTIONS,
} from "@/lib/onboarding/steps-config";
import { FormField } from "@/components/onboarding/form-field";
import { OptionCard } from "@/components/onboarding/option-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OnboardingStepsProps {
  step: number;
}

export function OnboardingSteps({ step }: OnboardingStepsProps) {
  const {
    register,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>();

  switch (step) {
    case 0:
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">Gym Track</span>
          </div>
          <FormField label="Ваше ім'я" htmlFor="name" error={errors.name}>
            <Input
              id="name"
              placeholder="Наприклад, Олексій"
              autoFocus
              {...register("name")}
            />
          </FormField>
        </div>
      );

    case 1:
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Вік" htmlFor="age" error={errors.age}>
            <Input
              id="age"
              type="number"
              min={10}
              max={120}
              {...register("age", { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Зріст (см)" htmlFor="heightCm" error={errors.heightCm}>
            <Input
              id="heightCm"
              type="number"
              min={100}
              max={250}
              {...register("heightCm", { valueAsNumber: true })}
            />
          </FormField>
          <div className="sm:col-span-2 space-y-2">
            <p className="text-sm font-medium">Стать</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {GENDER_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={watch("gender") === opt.value}
                  onClick={() =>
                    setValue("gender", opt.value as OnboardingFormValues["gender"], {
                      shouldValidate: true,
                    })
                  }
                  title={opt.label}
                />
              ))}
            </div>
            {errors.gender && (
              <p className="text-xs text-primary">{errors.gender.message}</p>
            )}
          </div>
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Поточна вага (кг)"
              htmlFor="currentWeightKg"
              error={errors.currentWeightKg}
            >
              <Input
                id="currentWeightKg"
                type="number"
                step="0.1"
                {...register("currentWeightKg", { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              label="Цільова вага (кг)"
              htmlFor="targetWeightKg"
              error={errors.targetWeightKg}
            >
              <Input
                id="targetWeightKg"
                type="number"
                step="0.1"
                {...register("targetWeightKg", { valueAsNumber: true })}
              />
            </FormField>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Мета</p>
            <div className="grid gap-2">
              {GOAL_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  emoji={opt.emoji}
                  selected={watch("goal") === opt.value}
                  onClick={() =>
                    setValue("goal", opt.value as OnboardingFormValues["goal"], {
                      shouldValidate: true,
                    })
                  }
                  title={opt.label}
                />
              ))}
            </div>
          </div>
        </div>
      );

    case 3:
      return (
        <div className="grid gap-2">
          {ACTIVITY_OPTIONS.map((opt) => (
            <OptionCard
              key={opt.value}
              selected={watch("activityLevel") === opt.value}
              onClick={() =>
                setValue(
                  "activityLevel",
                  opt.value as OnboardingFormValues["activityLevel"],
                  { shouldValidate: true }
                )
              }
              title={opt.label}
              description={opt.desc}
            />
          ))}
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <FormField label="Тип програми" error={errors.preferredSplit}>
            <Select
              value={watch("preferredSplit") || "PPL"}
              onValueChange={(v) =>
                setValue("preferredSplit", v, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Оберіть спліт" />
              </SelectTrigger>
              <SelectContent>
                {SPLIT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Відпочинок між підходами (с)"
              htmlFor="defaultRestSeconds"
              error={errors.defaultRestSeconds}
            >
              <Input
                id="defaultRestSeconds"
                type="number"
                min={30}
                max={300}
                {...register("defaultRestSeconds", { valueAsNumber: true })}
              />
            </FormField>
            <FormField label="Одиниці ваги" error={errors.weightUnit}>
              <Select
                value={watch("weightUnit")}
                onValueChange={(v) =>
                  setValue(
                    "weightUnit",
                    v as OnboardingFormValues["weightUnit"],
                    { shouldValidate: true }
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KG">Кілограми (кг)</SelectItem>
                  <SelectItem value="LB">Фунти (lb)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </div>
      );

    case 5:
      return (
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              const macros = estimateMacros(getValues());
              Object.entries(macros).forEach(([key, value]) =>
                setValue(key as keyof OnboardingFormValues, value, {
                  shouldValidate: true,
                })
              );
            }}
          >
            <Calculator className="h-4 w-4" />
            Розрахувати автоматично
          </Button>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Калорії"
              htmlFor="dailyCalories"
              error={errors.dailyCalories}
            >
              <Input
                id="dailyCalories"
                type="number"
                {...register("dailyCalories", { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              label="Білки (г)"
              htmlFor="dailyProteinG"
              error={errors.dailyProteinG}
            >
              <Input
                id="dailyProteinG"
                type="number"
                {...register("dailyProteinG", { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              label="Жири (г)"
              htmlFor="dailyFatG"
              error={errors.dailyFatG}
            >
              <Input
                id="dailyFatG"
                type="number"
                {...register("dailyFatG", { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              label="Вуглеводи (г)"
              htmlFor="dailyCarbsG"
              error={errors.dailyCarbsG}
            >
              <Input
                id="dailyCarbsG"
                type="number"
                {...register("dailyCarbsG", { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              label="Вода (мл)"
              htmlFor="dailyWaterMl"
              error={errors.dailyWaterMl}
              className="sm:col-span-2"
            >
              <Input
                id="dailyWaterMl"
                type="number"
                {...register("dailyWaterMl", { valueAsNumber: true })}
              />
            </FormField>
          </div>
        </div>
      );

    default:
      return null;
  }
}
