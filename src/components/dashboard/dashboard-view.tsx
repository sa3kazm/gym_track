"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  Flame,
  Loader2,
  Scale,
  Sparkles,
  Utensils,
} from "lucide-react";
import type { AnalysisSummaryResponse } from "@/types/analysis-api";
import { FitnessScoreRing } from "@/components/dashboard/fitness-score-ring";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ProportionBars } from "@/components/dashboard/proportion-bars";
import { WeakZonesPanel } from "@/components/dashboard/weak-zones-panel";
import { ScoreBreakdown } from "@/components/dashboard/score-breakdown";
import { MeasurementsForm } from "@/components/dashboard/measurements-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BodyMeasurementsPayload } from "@/lib/validations/body-measurements";

const GOAL_LABELS: Record<string, string> = {
  LOSS: "Схуднення",
  GAIN: "Набір",
  MAINTAIN: "Підтримка",
};

const BMI_BADGE: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  NORMAL: "success",
  UNDERWEIGHT: "warning",
  OVERWEIGHT: "warning",
  OBESE: "danger",
};

export function DashboardView() {
  const [data, setData] = useState<AnalysisSummaryResponse["data"] | null>(null);
  const [measurements, setMeasurements] =
    useState<BodyMeasurementsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, measRes] = await Promise.all([
        fetch("/api/analysis/summary"),
        fetch("/api/body-measurements"),
      ]);

      const summary = (await summaryRes.json()) as AnalysisSummaryResponse;
      if (!summaryRes.ok || !summary.success || !summary.data) {
        throw new Error(summary.error ?? "Не вдалося завантажити аналіз");
      }

      setData(summary.data);

      const measJson = await measRes.json();
      if (measRes.ok && measJson.success && measJson.data) {
        setMeasurements(measJson.data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка завантаження");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-primary">{error ?? "Немає даних"}</p>
        <Button asChild>
          <Link href="/onboarding">Пройти онбординг</Link>
        </Button>
      </main>
    );
  }

  const { analysis, profile, weightKg, targetWeightKg, nutrition } = data;
  const weightDiff =
    targetWeightKg != null
      ? Math.round((weightKg - targetWeightKg) * 10) / 10
      : null;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 pb-16">
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-1 flex items-center gap-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Підсумок аналізу
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Привіт, {profile.name || "атлете"}!
            </h1>
            <p className="mt-2 text-muted-foreground">
              {GOAL_LABELS[profile.goal] ?? profile.goal}
              {weightDiff != null && weightDiff !== 0 && (
                <>
                  {" "}
                  · до цілі{" "}
                  <span className="text-foreground font-medium">
                    {weightDiff > 0 ? `−${weightDiff}` : `+${Math.abs(weightDiff)}`}{" "}
                    кг
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/nutrition">Харчування</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/program">Програма</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/onboarding">Налаштування</Link>
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="border-primary/25 bg-gradient-to-b from-primary/10 to-card">
            <CardHeader className="text-center">
              <CardTitle>Fitness Score</CardTitle>
              <CardDescription>Комплексна оцінка форми</CardDescription>
            </CardHeader>
            <CardContent>
              <FitnessScoreRing score={analysis.fitnessScore} />
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          <MetricCard
            title="BMI"
            value={String(analysis.bmi.value)}
            subtitle={analysis.bmi.labelUk}
            icon={Scale}
            delay={0.15}
          />
          <MetricCard
            title="BMR"
            value={`${analysis.bmr.bmr}`}
            subtitle={`TDEE ~${analysis.bmr.tdee} ккал`}
            icon={Flame}
            delay={0.2}
          />
          <MetricCard
            title="Вага"
            value={`${weightKg} кг`}
            subtitle={
              targetWeightKg != null
                ? `Ціль: ${targetWeightKg} кг`
                : undefined
            }
            icon={Activity}
            delay={0.25}
          />
          {nutrition && (
            <MetricCard
              title="Калорії"
              value={`${nutrition.dailyCalories}`}
              subtitle={`Б ${nutrition.dailyProteinG} · Ж ${nutrition.dailyFatG} · В ${nutrition.dailyCarbsG}`}
              icon={Utensils}
              delay={0.3}
            />
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-6"
      >
        <Card>
          <CardContent className="flex flex-wrap gap-2 pt-6">
            <Badge variant={BMI_BADGE[analysis.bmi.category] ?? "secondary"}>
              BMI {analysis.bmi.value}
            </Badge>
            {analysis.mccallum.wristEstimated && (
              <Badge variant="secondary">Зап&apos;ястя — оцінка</Badge>
            )}
            <Badge variant="secondary">
              Зап&apos;ястя {analysis.mccallum.wristCm} см
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      {analysis.insights.length > 0 && (
        <motion.ul
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 space-y-2 rounded-xl border border-border/80 bg-card/50 p-5"
        >
          {analysis.insights.map((line, i) => (
            <li key={i} className="text-sm leading-relaxed text-muted-foreground">
              <span className="mr-2 text-primary">•</span>
              {line}
            </li>
          ))}
        </motion.ul>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ScoreBreakdown score={analysis.fitnessScore} />
        <WeakZonesPanel zones={analysis.weakZones} />
      </div>

      <div className="mt-6">
        <ProportionBars items={analysis.proportions} />
      </div>

      <div className="mt-6">
        <MeasurementsForm initial={measurements} onSaved={load} />
      </div>
    </main>
  );
}
