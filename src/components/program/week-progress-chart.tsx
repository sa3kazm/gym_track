"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeekStat {
  week: number;
  total: number;
  completed: number;
  percent: number;
}

export function WeekProgressChart() {
  const [weeks, setWeeks] = useState<WeekStat[]>([]);
  const [overall, setOverall] = useState(0);

  useEffect(() => {
    fetch("/api/program/progress")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setWeeks(json.data.weeks ?? []);
          setOverall(json.data.overall ?? 0);
        }
      });
  }, []);

  if (weeks.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Прогрес по тижнях</CardTitle>
        <p className="text-sm text-muted-foreground">
          Загалом виконано: <span className="text-primary font-medium">{overall}%</span>
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex h-40 items-end justify-between gap-3">
          {weeks.map((w, i) => (
            <div
              key={w.week}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <span className="text-xs font-medium tabular-nums">{w.percent}%</span>
              <motion.div
                className="w-full rounded-t-md bg-primary"
                initial={{ height: 0 }}
                animate={{ height: Math.max(4, (w.percent / 100) * 120) }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              />
              <span className="text-xs text-muted-foreground">
                Т{w.week}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {w.completed}/{w.total}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
