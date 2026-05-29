/** Легкі date-утиліти без date-fns */

export function startOfWeek(
  date: Date,
  options?: { weekStartsOn?: 0 | 1 }
): Date {
  const d = new Date(date);
  const day = d.getDay();
  const weekStartsOn = options?.weekStartsOn ?? 1;
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function format(date: Date, pattern: string): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  if (pattern === "yyyy-MM-dd") return `${y}-${m}-${d}`;
  return date.toISOString();
}
