"use client";

import { Trash2 } from "lucide-react";
import type { MealType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface NutritionEntryRow {
  id: string;
  grams: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  food: { name: string };
}

interface MealSectionProps {
  title: string;
  mealType: MealType;
  entries: NutritionEntryRow[];
  onRemove: (id: string) => void;
}

export function MealSection({
  title,
  entries,
  onRemove,
}: MealSectionProps) {
  const subtotal = entries.reduce(
    (a, e) => ({
      calories: a.calories + e.calories,
      protein: a.protein + e.protein,
    }),
    { calories: 0, protein: 0 }
  );

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span>{title}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {Math.round(subtotal.calories)} ккал · Б {Math.round(subtotal.protein)}г
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Порожньо</p>
        ) : (
          entries.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-secondary/30 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">{e.food.name}</p>
                <p className="text-xs text-muted-foreground">
                  {e.grams} г · {Math.round(e.calories)} ккал · Б{" "}
                  {Math.round(e.protein)} Ж {Math.round(e.fat)} В{" "}
                  {Math.round(e.carbs)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-primary"
                onClick={() => onRemove(e.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
