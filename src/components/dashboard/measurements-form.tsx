"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BodyMeasurementsPayload } from "@/lib/validations/body-measurements";

const FIELDS: { key: keyof BodyMeasurementsPayload; label: string }[] = [
  { key: "wristCm", label: "Зап'ястя" },
  { key: "neckCm", label: "Шия" },
  { key: "chestCm", label: "Груди" },
  { key: "waistCm", label: "Талія" },
  { key: "hipsCm", label: "Стегна" },
  { key: "bicepCm", label: "Біцепс" },
  { key: "forearmCm", label: "Передпліччя" },
  { key: "thighCm", label: "Стегно" },
  { key: "calfCm", label: "Литка" },
];

interface MeasurementsFormProps {
  initial?: BodyMeasurementsPayload | null;
  onSaved: () => void;
}

export function MeasurementsForm({ initial, onSaved }: MeasurementsFormProps) {
  const [values, setValues] = useState<BodyMeasurementsPayload>(() => ({
    wristCm: initial?.wristCm ?? null,
    neckCm: initial?.neckCm ?? null,
    chestCm: initial?.chestCm ?? null,
    waistCm: initial?.waistCm ?? null,
    hipsCm: initial?.hipsCm ?? null,
    bicepCm: initial?.bicepCm ?? null,
    forearmCm: initial?.forearmCm ?? null,
    thighCm: initial?.thighCm ?? null,
    calfCm: initial?.calfCm ?? null,
  }));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: BodyMeasurementsPayload = {};
      for (const { key } of FIELDS) {
        const v = values[key];
        payload[key] = v === "" || v == null ? null : Number(v);
      }

      const res = await fetch("/api/body-measurements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Помилка збереження");
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Ruler className="h-5 w-5 text-primary" />
          Заміри тіла (см)
        </CardTitle>
        <CardDescription>
          Обхвати для точного аналізу McCallum та слабких зон
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FIELDS.map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type="number"
                step="0.1"
                placeholder="—"
                value={values[key] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    [key]: e.target.value === "" ? null : e.target.value,
                  }))
                }
              />
            </div>
          ))}
        </div>
        <Button
          className="mt-4 w-full sm:w-auto"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Зберігаємо…" : "Оновити аналіз"}
        </Button>
      </CardContent>
    </Card>
  );
}
