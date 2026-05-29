"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, RefreshCw, Search } from "lucide-react";
import type { MealType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needProfile, setNeedProfile] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const loadFoods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/foods?q=${encodeURIComponent(query.trim())}`
      );
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Не вдалося завантажити продукти");
      }

      const list: FoodItem[] = json.data.foods ?? json.data ?? [];
      setFoods(list);
      setNeedProfile(Boolean(json.data.profileRequired));
      setSelectedId((prev) => {
        if (prev && list.some((f) => f.id === prev)) return prev;
        return list[0]?.id ?? "";
      });
    } catch (e) {
      setFoods([]);
      setSelectedId("");
      setError(e instanceof Error ? e.message : "Помилка завантаження");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const t = setTimeout(loadFoods, query ? 200 : 0);
    return () => clearTimeout(t);
  }, [loadFoods, query]);

  const handleSeed = async () => {
    setSeeding(true);
    setError(null);
    try {
      const res = await fetch("/api/foods/seed", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Помилка seed");
      }
      await loadFoods();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка");
    } finally {
      setSeeding(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedId) return;
    setAdding(true);
    setError(null);
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
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Не вдалося додати");
      }
      onAdded();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка");
    } finally {
      setAdding(false);
    }
  };

  const selected = foods.find((f) => f.id === selectedId);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            Додати продукт
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={loadFoods}
            disabled={loading}
            title="Оновити список"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Пошук: курка, рис, творог…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {needProfile && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            Спочатку пройдіть{" "}
            <Link href="/onboarding" className="underline text-primary">
              онбординг
            </Link>
            , щоб додавати їжу в щоденник.
          </p>
        )}

        {error && (
          <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm">
            <p>{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSeed}
              disabled={seeding}
            >
              {seeding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Завантажити базу продуктів
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : foods.length === 0 ? (
          <div className="space-y-2 py-4 text-center text-sm text-muted-foreground">
            <p>Продуктів у базі немає.</p>
            <Button type="button" variant="outline" onClick={handleSeed} disabled={seeding}>
              Завантажити 30 продуктів
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label>Оберіть продукт ({foods.length})</Label>
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-1">
                {foods.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedId(f.id)}
                    className={cn(
                      "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                      selectedId === f.id
                        ? "bg-primary/20 text-foreground"
                        : "hover:bg-secondary"
                    )}
                  >
                    <span className="font-medium">{f.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {f.caloriesPer100} ккал/100г
                    </span>
                  </button>
                ))}
              </div>
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

            {selected && (
              <p className="text-xs text-muted-foreground">
                Обрано: <strong>{selected.name}</strong> · Б{" "}
                {((selected.proteinPer100 * grams) / 100).toFixed(1)} г на порцію
              </p>
            )}
          </>
        )}

        <Button
          className="w-full"
          onClick={handleAdd}
          disabled={adding || !selectedId || needProfile}
        >
          {adding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Додати до прийому їжі
        </Button>
      </CardContent>
    </Card>
  );
}
