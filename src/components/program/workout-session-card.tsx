"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Dumbbell,
  Flame,
  RotateCcw,
} from "lucide-react";
import type { GeneratedWorkoutSession } from "@/lib/program-engine";
import { WorkoutCompleteDialog } from "@/components/program/workout-complete-dialog";
import { ExerciseEditRow } from "@/components/program/exercise-edit-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FOCUS_LABELS: Record<string, string> = {
  FULL: "Full Body",
  PUSH: "Push",
  PULL: "Pull",
  LEGS: "Legs",
  UPPER: "Upper",
  LOWER: "Lower",
};

interface WorkoutSessionCardProps {
  session: GeneratedWorkoutSession;
  onSessionUpdate: () => void;
}

export function WorkoutSessionCard({
  session,
  onSessionUpdate,
}: WorkoutSessionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uncancelling, setUncancelling] = useState(false);

  const handleUncomplete = async () => {
    setUncancelling(true);
    try {
      await fetch(`/api/program/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: false }),
      });
      onSessionUpdate();
    } finally {
      setUncancelling(false);
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card
          className={cn(
            "overflow-hidden transition-colors",
            session.completed
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "hover:border-primary/40"
          )}
        >
          <CardHeader
            className="cursor-pointer pb-3"
            onClick={() => setExpanded((e) => !e)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={session.completed ? "success" : "default"}>
                    {FOCUS_LABELS[session.focus] ?? session.focus}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Тиждень {session.weekNumber}
                  </span>
                </div>
                <CardTitle className="text-base leading-snug">
                  {session.label}
                </CardTitle>
                <CardDescription className="flex flex-wrap gap-3 text-xs">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {session.date}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />~{session.estimatedMinutes} хв
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Dumbbell className="h-3 w-3" />
                    {session.exercises.length} вправ
                  </span>
                  {session.totalVolumeLogged != null && (
                    <span className="text-emerald-400">
                      {Math.round(session.totalVolumeLogged)} кг обсяг
                    </span>
                  )}
                </CardDescription>
              </div>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                  expanded && "rotate-180"
                )}
              />
            </div>
          </CardHeader>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28 }}
              >
                <CardContent className="space-y-3 border-t border-border/60 pt-4">
                  {session.exercises.map((ex, i) => (
                    <div
                      key={`${ex.slug}-${i}`}
                      className="rounded-lg bg-secondary/40 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium">{ex.name}</p>
                        <Badge variant="secondary" className="shrink-0">
                          RPE {ex.rpe}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {ex.sets} × {ex.reps} · відпочинок {ex.restSeconds}с
                      </p>
                      <p className="mt-2 flex items-start gap-1.5 text-xs text-primary/90">
                        <Flame className="mt-0.5 h-3 w-3 shrink-0" />
                        {ex.notes}
                      </p>
                      {!session.completed && (
                        <ExerciseEditRow
                          exercise={ex}
                          exerciseIndex={i}
                          sessionId={session.id}
                          onUpdated={onSessionUpdate}
                        />
                      )}
                    </div>
                  ))}

                  {session.completed ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled={uncancelling}
                      onClick={handleUncomplete}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Скасувати виконання
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => setDialogOpen(true)}
                    >
                      <Check className="h-4 w-4" />
                      Завершити з логом
                    </Button>
                  )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      <WorkoutCompleteDialog
        session={session}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={onSessionUpdate}
      />
    </>
  );
}
