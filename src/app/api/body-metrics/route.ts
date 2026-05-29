import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  jsonCreated,
  jsonError,
  jsonOk,
  parseJsonBody,
} from "@/lib/api/response";
import {
  ProfileNotFoundError,
  requireDefaultProfile,
} from "@/lib/api/profile-context";
import { createBodyMetricsSchema } from "@/lib/validations";

/** GET /api/body-metrics?profileId=&from=&to=&limit= */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let profileId = searchParams.get("profileId");

    if (!profileId) {
      const profile = await requireDefaultProfile();
      profileId = profile.id;
    }

    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const limit = Math.min(Number(searchParams.get("limit") ?? 100), 500);

    const metrics = await prisma.bodyMetrics.findMany({
      where: {
        profileId,
        ...(from || to
          ? {
              recordedAt: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      orderBy: { recordedAt: "desc" },
      take: limit,
    });

    return jsonOk(metrics);
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}

/** POST /api/body-metrics */
export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Невалідний JSON", 400);

    const input = createBodyMetricsSchema.parse(body);
    const profileId =
      input.profileId ?? (await requireDefaultProfile()).id;

    const record = await prisma.bodyMetrics.create({
      data: {
        profileId,
        weightKg: input.weightKg,
        bodyFatPercent: input.bodyFatPercent ?? null,
        note: input.note ?? null,
        recordedAt: input.recordedAt ?? new Date(),
      },
    });

    return jsonCreated(record);
  } catch (error) {
    if (error instanceof ProfileNotFoundError) {
      return jsonError(error.message, 404);
    }
    return handleApiError(error);
  }
}
