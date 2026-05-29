import type { MonthlyProgram } from "@/lib/program-engine";

export interface WeekProgressStat {
  week: number;
  total: number;
  completed: number;
  percent: number;
}

export function computeWeekProgress(program: MonthlyProgram): WeekProgressStat[] {
  const stats: WeekProgressStat[] = [];

  for (let w = 1; w <= program.weeks; w++) {
    const sessions = program.sessions.filter((s) => s.weekNumber === w);
    const completed = sessions.filter((s) => s.completed).length;
    const total = sessions.length;
    stats.push({
      week: w,
      total,
      completed,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  }

  return stats;
}
