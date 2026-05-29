import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  jsonError,
  jsonOk,
  parseJsonBody,
} from "@/lib/api/response";
import { updateBodyMetricsSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

/** GET /api/body-metrics/:id */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const record = await prisma.bodyMetrics.findUnique({ where: { id } });
    if (!record) return jsonError("Запис не знайдено", 404);
    return jsonOk(record);
  } catch (error) {
    return handleApiError(error);
  }
}

/** PATCH /api/body-metrics/:id */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Невалідний JSON", 400);

    const input = updateBodyMetricsSchema.parse(body);
    const record = await prisma.bodyMetrics.update({
      where: { id },
      data: input,
    });

    return jsonOk(record);
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/body-metrics/:id */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.bodyMetrics.delete({ where: { id } });
    return jsonOk({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
