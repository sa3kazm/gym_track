"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, UtensilsCrossed } from "lucide-react";
import type { MealType } from "@prisma/client";
import { MacroBar } from "@/components/nutrition/macro-bar";
import { FoodSearchPanel } from "@/components/nutrition/food-search-panel";
import { AddCustomFood } from "@/components/nutrition/add-custom-food";
import {
  MealSection,
  type NutritionEntryRow,
} from "@/components/nutrition/meal-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toDateOnlyString } from "@/lib/nutrition/macros";

const MEAL_LABELS: Record<MealType, string> = {
  BREAKFAST: "Сніданок",
  LUNCH: "Обід",
  DINNER: "Вечеря",
  SNACKS: "Перекуси",
};

interface DayLog {
  date: string;
  meals: Record<MealType, NutritionEntryRow[]>;
  totals: { calories: number; protein: number; fat: number; carbs: number };
  goals: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  } | null;
}

export function NutritionView() {
  const [date, setDate] = useState(toDateOnlyString());
  const [mealType, setMealType] = useState<MealType>("BREAKFAST");
  const [log, setLog] = useState<DayLog | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/nutrition?date=${date}`);
      const json = await res.json();
      if (json.success) setLog(json.data);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const removeEntry = async (id: string) => {
    await fetch(`/api/nutrition/entries/${id}`, { method: "DELETE" });
    load();
  };

  if (loading && !log) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const goals = log?.goals ?? {
    calories: 2000,
    protein: 150,
    fat: 65,
    carbs: 220,
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
            Харчування
          </h1>
          <p className="mt-1 text-muted-foreground">
            Щоденник їжі та база продуктів
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Аналіз</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">Головна</Link>
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="date">Дата</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-auto"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Прийом їжі</Label>
          <Select
            value={mealType}
            onValueChange={(v) => setMealType(v as MealType)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(MEAL_LABELS) as MealType[]).map((m) => (
                <SelectItem key={m} value={m}>
                  {MEAL_LABELS[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <AddCustomFood onAdded={load} />
      </div>

      {log && (
        <div className="mb-8 space-y-3 rounded-xl border border-border/80 bg-card/50 p-5">
          <h2 className="text-lg font-semibold">Денні норми</h2>
          <MacroBar
            label="Калорії"
            current={log.totals.calories}
            goal={goals.calories}
            colorClass="bg-primary"
          />
          <MacroBar
            label="Білки"
            current={log.totals.protein}
            goal={goals.protein}
            unit="г"
            colorClass="bg-sky-500"
          />
          <MacroBar
            label="Жири"
            current={log.totals.fat}
            goal={goals.fat}
            unit="г"
            colorClass="bg-amber-500"
          />
          <MacroBar
            label="Вуглеводи"
            current={log.totals.carbs}
            goal={goals.carbs}
            unit="г"
            colorClass="bg-emerald-500"
          />
        </div>
      )}

      <div className="mb-8">
        <FoodSearchPanel mealType={mealType} date={date} onAdded={load} />
      </div>

      {log && (
        <div className="space-y-4">
          {(Object.keys(MEAL_LABELS) as MealType[]).map((m) => (
            <MealSection
              key={m}
              title={MEAL_LABELS[m]}
              mealType={m}
              entries={log.meals[m] ?? []}
              onRemove={removeEntry}
            />
          ))}
        </div>
      )}
    </main>
  );
}
