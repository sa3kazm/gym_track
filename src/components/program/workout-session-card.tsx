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
} from "lucide-react";
import type { GeneratedWorkoutSession } from "@/lib/program-engine";
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
  onToggleComplete: (sessionId: string, completed: boolean) => void;
}

export function WorkoutSessionCard({
  session,
  onToggleComplete,
}: WorkoutSessionCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card
        className={cn(
          "cursor-pointer overflow-hidden transition-colors",
          session.completed
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "hover:border-primary/40"
        )}
        onClick={() => setExpanded((e) => !e)}
      >
        <CardHeader className="pb-3">
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
              onClick={(e) => e.stopPropagation()}
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
                  </div>
                ))}

                <Button
                  className="w-full"
                  variant={session.completed ? "outline" : "default"}
                  onClick={() =>
                    onToggleComplete(session.id, !session.completed)
                  }
                >
                  <Check className="h-4 w-4" />
                  {session.completed
                    ? "Скасувати виконання"
                    : "Позначити виконаним"}
                </Button>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
