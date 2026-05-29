"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import type { GeneratedWorkoutSession } from "@/lib/program-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function defaultReps(reps: string): number {
  const m = reps.match(/(\d+)/);
  return m ? Number(m[1]) : 10;
}

export interface ExerciseLogDraft {
  exerciseId: string;
  sets: { weightKg: number; reps: number }[];
}

interface WorkoutCompleteDialogProps {
  session: GeneratedWorkoutSession;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function WorkoutCompleteDialog({
  session,
  open,
  onClose,
  onSaved,
}: WorkoutCompleteDialogProps) {
  const [logs, setLogs] = useState<ExerciseLogDraft[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLogs(
      session.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        sets: Array.from({ length: ex.sets }, () => ({
          weightKg: 0,
          reps: defaultReps(ex.reps),
        })),
      }))
    );
    setError(null);
  }, [open, session]);

  if (!open) return null;

  const updateSet = (
    exIdx: number,
    setIdx: number,
    field: "weightKg" | "reps",
    value: number
  ) => {
    setLogs((prev) => {
      const next = structuredClone(prev);
      next[exIdx].sets[setIdx][field] = value;
      return next;
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/program/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true, logs, notes: notes || undefined }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Помилка збереження");
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card shadow-xl"
        role="dialog"
        aria-labelledby="complete-title"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card p-4">
          <h2 id="complete-title" className="text-lg font-semibold">
            Лог тренування
          </h2>
          <button type="button" onClick={onClose} aria-label="Закрити">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-4">
          <p className="text-sm text-muted-foreground">{session.label}</p>

          {logs.map((log, exIdx) => {
            const ex = session.exercises[exIdx];
            return (
              <div key={ex.exerciseId} className="space-y-3 rounded-lg bg-secondary/30 p-3">
                <p className="font-medium">{ex.name}</p>
                <p className="text-xs text-muted-foreground">
                  План: {ex.sets}×{ex.reps} · RPE {ex.rpe}
                </p>
                {log.sets.map((set, setIdx) => (
                  <div
                    key={setIdx}
                    className="grid grid-cols-[auto_1fr_1fr] items-center gap-2"
                  >
                    <span className="text-xs text-muted-foreground w-8">
                      #{setIdx + 1}
                    </span>
                    <div>
                      <Label className="text-xs">кг</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.5"
                        value={set.weightKg || ""}
                        onChange={(e) =>
                          updateSet(exIdx, setIdx, "weightKg", Number(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">повтори</Label>
                      <Input
                        type="number"
                        min={0}
                        value={set.reps || ""}
                        onChange={(e) =>
                          updateSet(exIdx, setIdx, "reps", Number(e.target.value) || 0)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          <div className="space-y-2">
            <Label htmlFor="notes">Нотатки</Label>
            <Input
              id="notes"
              placeholder="Самопочуття, техніка…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-primary">{error}</p>}

          <Button className="w-full" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Зберегти та завершити
          </Button>
        </div>
      </div>
    </div>
  );
}
