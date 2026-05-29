import { prisma } from "@/lib/prisma";
import { parseProgram, isProgramV2, serializeProgram } from "./schedule";
import type { MonthlyProgram } from "@/lib/program-engine";

export async function getActiveProgram(profileId: string) {
  const plan = await prisma.workoutPlan.findFirst({
    where: { profileId },
    orderBy: { createdAt: "desc" },
  });

  if (!plan || !isProgramV2(plan.schedule)) {
    return null;
  }

  return {
    plan,
    program: parseProgram(plan.schedule),
  };
}

export async function saveProgram(
  planId: string,
  program: MonthlyProgram
) {
  return prisma.workoutPlan.update({
    where: { id: planId },
    data: { schedule: serializeProgram(program) },
  });
}
