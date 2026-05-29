"use client";

import { useEffect, useState } from "react";
import type { MonthlyProgram } from "@/lib/program-engine";
import { getSplitLabel } from "@/lib/program-engine/split-selector";

export function ProgramPrintView() {
  const [program, setProgram] = useState<MonthlyProgram | null>(null);
  const [planName, setPlanName] = useState("");

  useEffect(() => {
    fetch("/api/program/current")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data.program) {
          setProgram(json.data.program);
          setPlanName(json.data.plan?.name ?? "Програма");
        }
      });
  }, []);

  useEffect(() => {
    if (program) {
      const t = setTimeout(() => window.print(), 500);
      return () => clearTimeout(t);
    }
  }, [program]);

  if (!program) {
    return <p className="p-8">Завантаження…</p>;
  }

  const byWeek = new Map<number, typeof program.sessions>();
  for (const s of program.sessions) {
    const list = byWeek.get(s.weekNumber) ?? [];
    list.push(s);
    byWeek.set(s.weekNumber, list);
  }

  return (
    <div className="print-root mx-auto max-w-3xl p-8 text-black bg-white min-h-screen">
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
        }
        @media screen {
          .print-root { background: #fff; color: #111; }
        }
      `}</style>

      <button
        type="button"
        className="no-print mb-6 rounded border px-4 py-2"
        onClick={() => window.print()}
      >
        Друк / Зберегти як PDF
      </button>

      <header className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold">Gym Track — {planName}</h1>
        <p className="text-sm text-gray-600">
          {getSplitLabel(program.splitType)} · {program.startDate} — {program.endDate}
        </p>
      </header>

      {Array.from(byWeek.entries()).map(([week, sessions]) => (
        <section key={week} className="mb-8 break-inside-avoid">
          <h2 className="mb-3 text-lg font-semibold">Тиждень {week}</h2>
          {sessions.map((session) => (
            <div key={session.id} className="mb-4 rounded border p-3">
              <h3 className="font-medium">
                {session.date} — {session.label}
                {session.completed ? " ✓" : ""}
              </h3>
              <ul className="mt-2 space-y-1 text-sm">
                {session.exercises.map((ex) => (
                  <li key={ex.slug}>
                    {ex.name}: {ex.sets}×{ex.reps}, RPE {ex.rpe}, відпоч. {ex.restSeconds}с
                  </li>
                ))}
              </ul>
              {session.totalVolumeLogged != null && (
                <p className="mt-1 text-xs text-gray-500">
                  Обсяг: {Math.round(session.totalVolumeLogged)} кг
                </p>
              )}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
