export function calculateMacrosFrom100g(
  per100: {
    caloriesPer100: number;
    proteinPer100: number;
    fatPer100: number;
    carbsPer100: number;
  },
  grams: number
) {
  const ratio = grams / 100;
  return {
    calories: round(per100.caloriesPer100 * ratio),
    protein: round(per100.proteinPer100 * ratio),
    fat: round(per100.fatPer100 * ratio),
    carbs: round(per100.carbsPer100 * ratio),
  };
}

export function sumMacros(
  entries: { calories: number; protein: number; fat: number; carbs: number }[]
) {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      fat: acc.fat + e.fat,
      carbs: acc.carbs + e.carbs,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}

export function toDateOnlyString(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function parseLogDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}
