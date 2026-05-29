"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function HomeClient() {
  const [hydrated, setHydrated] = useState(false);
  const isCompleted = useOnboardingStore((s) => s.isCompleted);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p className="text-muted-foreground">Завантаження…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Gym Track</CardTitle>
          <CardDescription>
            {isCompleted
              ? "Онбординг завершено. API та трекер готові до роботи."
              : "Пройдіть коротке налаштування профілю."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {!isCompleted && (
            <Button asChild>
              <Link href="/onboarding">Почати онбординг</Link>
            </Button>
          )}
          {isCompleted && (
            <>
              <Button asChild>
                <Link href="/dashboard">Відкрити підсумок</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/program">Програма тренувань</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/nutrition">Харчування</Link>
              </Button>
            </>
          )}
          <Button variant="outline" asChild>
            <Link href="/onboarding">
              {isCompleted ? "Редагувати профіль" : "Продовжити налаштування"}
            </Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Legacy UI: відкрийте <code className="text-foreground">index.html</code> у корені проєкту
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
