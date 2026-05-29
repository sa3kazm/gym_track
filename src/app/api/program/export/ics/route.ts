import { generateProgramIcs } from "@/lib/export/ics";
import { jsonError } from "@/lib/api/response";
import {
  ProfileNotFoundError,
  requireDefaultProfile,
} from "@/lib/api/profile-context";
import { getActiveProgram } from "@/lib/program/active-plan";

/** GET /api/program/export/ics */
export async function GET() {
  try {
    const profile = await requireDefaultProfile();
    const active = await getActiveProgram(profile.id);
    if (!active) {
      return jsonError("Програму не знайдено", 404);
    }

    const ics = generateProgramIcs(active.program, active.plan.name);

    return new Response(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="gym-program.ics"`,
      },
    });
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return jsonError("Помилка експорту", 500);
  }
}
