"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { MonthlyProgram } from "@/lib/program-engine";
import { ProgramGenerator } from "@/components/program/program-generator";
import { ProgramMonthView } from "@/components/program/program-month-view";
import { Button } from "@/components/ui/button";

interface ProgramData {
  plan: { id: string; name: string; description: string | null } | null;
  program: MonthlyProgram | null;
}

export function ProgramView() {
  const [data, setData] = useState<ProgramData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/program/current");
      const json = await res.json();
      if (json.success) {
        setData({ plan: json.data.plan, program: json.data.program });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Програма тренувань</h1>
          <p className="mt-1 text-muted-foreground">
            Генерація та план на 4 тижні
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Аналіз тіла</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">Головна</Link>
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <ProgramGenerator onGenerated={load} />
      </div>

      {data?.program ? (
        <ProgramMonthView program={data.program} onSessionUpdate={load} />
      ) : (
        <p className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Згенеруйте програму вище — тут з&apos;явиться календар на місяць
        </p>
      )}
    </main>
  );
}
