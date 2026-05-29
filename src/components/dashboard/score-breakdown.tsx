"use client";

import { motion } from "framer-motion";
import type { FitnessScoreBreakdown } from "@/lib/analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ITEMS: {
  key: keyof Pick<
    FitnessScoreBreakdown,
    "bmiScore" | "proportionScore" | "goalScore" | "activityScore"
  >;
  label: string;
  weight: string;
}[] = [
  { key: "bmiScore", label: "BMI / здоров'я", weight: "25%" },
  { key: "proportionScore", label: "Пропорції", weight: "35%" },
  { key: "goalScore", label: "Ціль ваги", weight: "20%" },
  { key: "activityScore", label: "Активність", weight: "20%" },
];

interface ScoreBreakdownProps {
  score: FitnessScoreBreakdown;
}

export function ScoreBreakdown({ score }: ScoreBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Склад Fitness Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ITEMS.map((item, i) => (
          <div key={item.key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.label}{" "}
                <span className="text-xs">({item.weight})</span>
              </span>
              <span className="font-medium tabular-nums">{score[item.key]}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full bg-primary/80"
                initial={{ width: 0 }}
                animate={{ width: `${score[item.key]}%` }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
