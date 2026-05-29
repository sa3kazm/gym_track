"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { MonthlyProgram } from "@/lib/program-engine";
import { getSplitLabel } from "@/lib/program-engine/split-selector";
import { WorkoutSessionCard } from "@/components/program/workout-session-card";
import { WeekProgressChart } from "@/components/program/week-progress-chart";
import { ProgramExportButtons } from "@/components/program/program-export-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProgramMonthViewProps {
  program: MonthlyProgram;
  onSessionUpdate: () => void;
}

export function ProgramMonthView({
  program,
  onSessionUpdate,
}: ProgramMonthViewProps) {
  const [activeWeek, setActiveWeek] = useState(1);
  const [chartKey, setChartKey] = useState(0);

  const weeks = useMemo(() => {
    const map = new Map<number, typeof program.sessions>();
    for (const s of program.sessions) {
      const list = map.get(s.weekNumber) ?? [];
      list.push(s);
      map.set(s.weekNumber, list);
    }
    return map;
  }, [program.sessions]);

  const weekSessions = weeks.get(activeWeek) ?? [];
  const completed = program.sessions.filter((s) => s.completed).length;
  const progress = Math.round(
    (completed / program.sessions.length) * 100
  );

  const handleUpdate = () => {
    onSessionUpdate();
    setChartKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/80 bg-card/50 p-4"
      >
        <div>
          <h2 className="text-xl font-semibold">
            {getSplitLabel(program.splitType)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {program.startDate} — {program.endDate} · {program.daysPerWeek}{" "}
            дні/тиж · {program.summary.totalSessions} тренувань
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{progress}%</p>
          <p className="text-xs text-muted-foreground">виконано</p>
        </div>
      </motion.div>

      <ProgramExportButtons />

      <WeekProgressChart key={chartKey} />

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: program.weeks }, (_, i) => i + 1).map((w) => {
          const sessions = weeks.get(w) ?? [];
          const done = sessions.filter((s) => s.completed).length;
          return (
            <Button
              key={w}
              variant={activeWeek === w ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveWeek(w)}
              className={cn("min-w-[4.5rem]")}
            >
              Тиж. {w}
              <Badge variant="secondary" className="ml-1.5 text-[10px]">
                {done}/{sessions.length}
              </Badge>
            </Button>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {weekSessions.map((session) => (
          <WorkoutSessionCard
            key={session.id}
            session={session}
            onSessionUpdate={handleUpdate}
          />
        ))}
      </div>

      {weekSessions.length === 0 && (
        <p className="text-center text-muted-foreground">
          Немає тренувань на цей тиждень
        </p>
      )}
    </div>
  );
}
