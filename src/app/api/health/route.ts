import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api/response";

/** GET /api/health */
export async function GET() {
  await prisma.$queryRaw`SELECT 1`;
  return jsonOk({ status: "ok", timestamp: new Date().toISOString() });
}
