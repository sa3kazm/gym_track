"use client";

import { cn } from "@/lib/utils";

interface MacroBarProps {
  label: string;
  current: number;
  goal: number;
  unit?: string;
  colorClass?: string;
}

export function MacroBar({
  label,
  current,
  goal,
  unit = "",
  colorClass = "bg-primary",
}: MacroBarProps) {
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums font-medium">
          {Math.round(current)}
          {unit} / {goal}
          {unit}
          <span className="ml-1 text-xs text-muted-foreground">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
