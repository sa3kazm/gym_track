"use client";

import { useState } from "react";
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

interface AddCustomFoodProps {
  onAdded: () => void;
}

export function AddCustomFood({ onAdded }: AddCustomFoodProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState(100);
  const [protein, setProtein] = useState(10);
  const [fat, setFat] = useState(5);
  const [carbs, setCarbs] = useState(10);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          caloriesPer100: calories,
          proteinPer100: protein,
          fatPer100: fat,
          carbsPer100: carbs,
        }),
      });
      if (!res.ok) throw new Error();
      setName("");
      setOpen(false);
      onAdded();
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        + Свій продукт
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Новий продукт</CardTitle>
        <CardDescription>БЖУ на 100 г</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1.5">
          <Label>Назва</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Ккал</Label>
          <Input type="number" value={calories} onChange={(e) => setCalories(Number(e.target.value))} />
        </div>
        <div className="space-y-1.5">
          <Label>Білки</Label>
          <Input type="number" value={protein} onChange={(e) => setProtein(Number(e.target.value))} />
        </div>
        <div className="space-y-1.5">
          <Label>Жири</Label>
          <Input type="number" value={fat} onChange={(e) => setFat(Number(e.target.value))} />
        </div>
        <div className="space-y-1.5">
          <Label>Вуглеводи</Label>
          <Input type="number" value={carbs} onChange={(e) => setCarbs(Number(e.target.value))} />
        </div>
        <div className="sm:col-span-2 flex gap-2">
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            Зберегти
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Скасувати
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
