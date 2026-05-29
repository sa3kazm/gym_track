"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import type { MealType } from "@prisma/client";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FoodItem {
  id: string;
  name: string;
  caloriesPer100: number;
  proteinPer100: number;
  category: string;
}

interface FoodSearchPanelProps {
  mealType: MealType;
  date: string;
  onAdded: () => void;
}

export function FoodSearchPanel({
  mealType,
  date,
  onAdded,
}: FoodSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [grams, setGrams] = useState(100);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await fetch(
        `/api/foods?q=${encodeURIComponent(query)}`
      );
      const json = await res.json();
      if (json.success) {
        setFoods(json.data);
        setSelectedId((prev) => prev || json.data[0]?.id || "");
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const handleAdd = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodId: selectedId,
          grams,
          mealType,
          date,
        }),
      });
      if (!res.ok) throw new Error();
      onAdded();
      setQuery("");
    } finally {
      setLoading(false);
    }
  };

  const selected = foods.find((f) => f.id === selectedId);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Search className="h-4 w-4 text-primary" />
          Додати продукт
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Пошук: курка, рис, творог…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Продукт</Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger>
                <SelectValue placeholder="Оберіть" />
              </SelectTrigger>
              <SelectContent>
                {foods.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name} ({f.caloriesPer100} ккал/100г)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Грами</Label>
            <Input
              type="number"
              min={1}
              value={grams}
              onChange={(e) => setGrams(Number(e.target.value) || 100)}
            />
          </div>
        </div>
        {selected && (
          <p className="text-xs text-muted-foreground">
            Б {((selected.proteinPer100 * grams) / 100).toFixed(1)} г білка на
            порцію
          </p>
        )}
        <Button className="w-full" onClick={handleAdd} disabled={loading || !selectedId}>
          <Plus className="h-4 w-4" />
          Додати до прийому їжі
        </Button>
      </CardContent>
    </Card>
  );
}
