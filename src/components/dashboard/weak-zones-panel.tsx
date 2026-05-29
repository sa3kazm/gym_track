"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Target } from "lucide-react";
import type { WeakZone } from "@/lib/analysis";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SEVERITY_VARIANT = {
  MILD: "secondary" as const,
  MODERATE: "warning" as const,
  SIGNIFICANT: "danger" as const,
};

const SEVERITY_LABEL = {
  MILD: "Легко",
  MODERATE: "Помірно",
  SIGNIFICANT: "Суттєво",
};

interface WeakZonesPanelProps {
  zones: WeakZone[];
}

export function WeakZonesPanel({ zones }: WeakZonesPanelProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Слабкі зони
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Пріоритети для наступного циклу тренувань
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {zones.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Критичних відхилень не виявлено. Продовжуйте збалансовану програму.
          </p>
        ) : (
          zones.map((zone, i) => (
            <motion.div
              key={`${zone.key}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-lg border border-border/80 bg-secondary/30 p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  {zone.labelUk}
                </span>
                <Badge variant={SEVERITY_VARIANT[zone.severity]}>
                  {SEVERITY_LABEL[zone.severity]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                Відхилення від ідеалу: {zone.deviationPercent}%
              </p>
              <p className="text-sm leading-relaxed">
                {zone.recommendationUk}
              </p>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
