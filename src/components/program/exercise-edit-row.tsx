"use client";

import { useEffect, useState } from "react";
import { Pencil, Save } from "lucide-react";
import type { GeneratedExercisePrescription } from "@/lib/program-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExerciseOption {
  id: string;
  name: string;
}

interface ExerciseEditRowProps {
  exercise: GeneratedExercisePrescription;
  exerciseIndex: number;
  sessionId: string;
  onUpdated: () => void;
}

export function ExerciseEditRow({
  exercise,
  exerciseIndex,
  sessionId,
  onUpdated,
}: ExerciseEditRowProps) {
  const [editing, setEditing] = useState(false);
  const [sets, setSets] = useState(exercise.sets);
  const [reps, setReps] = useState(exercise.reps);
  const [rpe, setRpe] = useState(exercise.rpe);
  const [restSeconds, setRestSeconds] = useState(exercise.restSeconds);
  const [replaceId, setReplaceId] = useState(exercise.exerciseId);
  const [options, setOptions] = useState<ExerciseOption[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    fetch("/api/exercises")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setOptions(json.data.map((e: ExerciseOption) => ({ id: e.id, name: e.name })));
        }
      });
  }, [editing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/program/sessions/${sessionId}/exercises/${exerciseIndex}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sets,
            reps,
            rpe,
            restSeconds,
            ...(replaceId !== exercise.exerciseId
              ? { replaceExerciseId: replaceId }
              : {}),
          }),
        }
      );
      if (!res.ok) throw new Error("Помилка збереження");
      setEditing(false);
      onUpdated();
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={() => setEditing(true)}
      >
        <Pencil className="h-3 w-3" />
        Редагувати
      </Button>
    );
  }

  return (
    <div className="mt-3 space-y-2 rounded-md border border-border/60 bg-background/50 p-3">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Замінити вправу</p>
        <Select value={replaceId} onValueChange={setReplaceId}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <div>
          <p className="text-[10px] text-muted-foreground">Підходи</p>
          <Input
            type="number"
            className="h-8"
            value={sets}
            onChange={(e) => setSets(Number(e.target.value))}
          />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Повтори</p>
          <Input
            className="h-8"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
          />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">RPE</p>
          <Input
            type="number"
            step="0.5"
            className="h-8"
            value={rpe}
            onChange={(e) => setRpe(Number(e.target.value))}
          />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Відпоч.</p>
          <Input
            type="number"
            className="h-8"
            value={restSeconds}
            onChange={(e) => setRestSeconds(Number(e.target.value))}
          />
        </div>
      </div>
      <Button size="sm" className="w-full" onClick={handleSave} disabled={saving}>
        <Save className="h-3 w-3" />
        {saving ? "…" : "Зберегти"}
      </Button>
    </div>
  );
}
