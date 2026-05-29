"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const EQUIPMENT_OPTIONS = [
  { value: "BARBELL", label: "Штанга" },
  { value: "DUMBBELL", label: "Гантелі" },
  { value: "CABLE", label: "Блоки" },
  { value: "MACHINE", label: "Тренажери" },
  { value: "BODYWEIGHT", label: "Вага тіла" },
];

const INJURY_OPTIONS = [
  { value: "LOWER_BACK", label: "Спина" },
  { value: "SHOULDER", label: "Плече" },
  { value: "KNEE", label: "Коліно" },
  { value: "WRIST", label: "Зап'ястя" },
  { value: "ELBOW", label: "Лікоть" },
  { value: "HIP", label: "Стегно" },
];

interface ProgramGeneratorProps {
  onGenerated: () => void;
}

export function ProgramGenerator({ onGenerated }: ProgramGeneratorProps) {
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [preferredSplit, setPreferredSplit] = useState("AUTO");
  const [experienceLevel, setExperienceLevel] = useState("INTERMEDIATE");
  const [equipment, setEquipment] = useState<string[]>([
    "BARBELL",
    "DUMBBELL",
    "CABLE",
    "MACHINE",
    "BODYWEIGHT",
  ]);
  const [injuries, setInjuries] = useState<string[]>([]);
  const [useWeakZones, setUseWeakZones] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (list: string[], value: string, setter: (v: string[]) => void) => {
    setter(
      list.includes(value)
        ? list.filter((x) => x !== value)
        : [...list, value]
    );
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/program/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          daysPerWeek,
          preferredSplit,
          experienceLevel,
          availableEquipment: equipment,
          injuries,
          useWeakZones,
          weeks: 4,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Помилка генерації");
      }
      onGenerated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Генератор програми
        </CardTitle>
        <CardDescription>
          AI-алгоритм підбере спліт, вправи, RPE та progressive overload на 4
          тижні
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Днів на тиждень</Label>
            <Select
              value={String(daysPerWeek)}
              onValueChange={(v) => setDaysPerWeek(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Спліт</Label>
            <Select value={preferredSplit} onValueChange={setPreferredSplit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AUTO">Авто</SelectItem>
                <SelectItem value="FULL_BODY">Full Body</SelectItem>
                <SelectItem value="UPPER_LOWER">Upper / Lower</SelectItem>
                <SelectItem value="PPL">Push / Pull / Legs</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Досвід</Label>
            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BEGINNER">Початківець</SelectItem>
                <SelectItem value="INTERMEDIATE">Середній</SelectItem>
                <SelectItem value="ADVANCED">Просунутий</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Обладнання</Label>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(equipment, opt.value, setEquipment)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  equipment.includes(opt.value)
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Обмеження / травми</Label>
          <div className="flex flex-wrap gap-2">
            {INJURY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(injuries, opt.value, setInjuries)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  injuries.includes(opt.value)
                    ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
                    : "border-border text-muted-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={useWeakZones}
            onChange={(e) => setUseWeakZones(e.target.checked)}
            className="rounded border-border"
          />
          Врахувати слабкі зони з аналізу тіла
        </label>

        {error && (
          <p className="text-sm text-primary" role="alert">
            {error}
          </p>
        )}

        <Button
          className="w-full"
          onClick={handleGenerate}
          disabled={loading || equipment.length === 0}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Згенерувати план на місяць
        </Button>
      </CardContent>
    </Card>
  );
}
