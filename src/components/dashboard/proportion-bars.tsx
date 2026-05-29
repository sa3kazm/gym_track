"use client";

import { motion } from "framer-motion";
import type { ProportionComparison } from "@/lib/analysis";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProportionBarsProps {
  items: ProportionComparison[];
}

export function ProportionBars({ items }: ProportionBarsProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Пропорції McCallum</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Додайте обхвати тіла нижче — порівняємо з ідеальними пропорціями.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Пропорції McCallum</CardTitle>
        <p className="text-sm text-muted-foreground">
          Факт vs ідеал (формула зап&apos;ястя)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, i) => {
          const pct = Math.min(100, Math.round(item.ratio * 100));
          const variant =
            item.status === "ON_TARGET"
              ? "success"
              : item.status === "BELOW"
                ? "warning"
                : "secondary";

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.labelUk}</span>
                <div className="flex items-center gap-2">
                  <span className="tabular-nums text-muted-foreground">
                    {item.actualCm} / {item.idealCm} см
                  </span>
                  <Badge variant={variant}>
                    {item.deviationPercent > 0 ? "+" : ""}
                    {item.deviationPercent}%
                  </Badge>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.6 }}
                />
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
