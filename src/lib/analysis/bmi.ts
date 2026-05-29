import type { BmiCategory, BmiResult } from "./types";

const BMI_LABELS: Record<BmiCategory, string> = {
  UNDERWEIGHT: "Недостатня вага",
  NORMAL: "Норма",
  OVERWEIGHT: "Надмірна вага",
  OBESE: "Ожиріння",
};

export function calculateBMI(weightKg: number, heightCm: number): BmiResult {
  const heightM = heightCm / 100;
  const value = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  let category: BmiCategory;
  if (value < 18.5) category = "UNDERWEIGHT";
  else if (value < 25) category = "NORMAL";
  else if (value < 30) category = "OVERWEIGHT";
  else category = "OBESE";

  return {
    value,
    category,
    labelUk: BMI_LABELS[category],
  };
}

/** 0–100: пік при BMI 21–23 */
export function scoreBmiHealth(bmi: number): number {
  if (bmi < 16 || bmi > 40) return 20;
  if (bmi >= 18.5 && bmi < 25) {
    const dist = Math.abs(bmi - 21.5);
    return Math.round(100 - dist * 12);
  }
  if (bmi < 18.5) return Math.round(50 + (bmi - 16) * 10);
  return Math.round(Math.max(30, 85 - (bmi - 25) * 14));
}
