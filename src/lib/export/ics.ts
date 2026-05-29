import type { MonthlyProgram } from "@/lib/program-engine";

function formatIcsDate(dateStr: string, hour = 18, minute = 0): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, hour, minute, 0));
  return dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeIcs(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function generateProgramIcs(
  program: MonthlyProgram,
  planName: string
): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gym Track//Program//UK",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const session of program.sessions) {
    const start = formatIcsDate(session.date, 18, 0);
    const end = formatIcsDate(session.date, 19, 30);
    const summary = escapeIcs(`${session.label} — ${planName}`);
    const description = escapeIcs(
      session.exercises.map((e) => `${e.name}: ${e.sets}×${e.reps} RPE${e.rpe}`).join("\\n")
    );

    lines.push(
      "BEGIN:VEVENT",
      `UID:${session.id}@gym-track`,
      `DTSTAMP:${formatIcsDate(new Date().toISOString().slice(0, 10))}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
