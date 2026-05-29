import { computeWeekProgress } from "@/lib/program/progress";
import {
  handleApiError,
  jsonError,
  jsonOk,
} from "@/lib/api/response";
import {
  ProfileNotFoundError,
  requireDefaultProfile,
} from "@/lib/api/profile-context";
import { getActiveProgram } from "@/lib/program/active-plan";

/** GET /api/program/progress */
export async function GET() {
  try {
    const profile = await requireDefaultProfile();
    const active = await getActiveProgram(profile.id);
    if (!active) return jsonOk({ weeks: [], overall: 0 });

    const weeks = computeWeekProgress(active.program);
    const total = active.program.sessions.length;
    const completed = active.program.sessions.filter((s) => s.completed).length;

    return jsonOk({
      weeks,
      overall: total > 0 ? Math.round((completed / total) * 100) : 0,
      completed,
      total,
    });
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}
