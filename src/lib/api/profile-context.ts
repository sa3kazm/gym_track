import { prisma } from "@/lib/prisma";

/**
 * MVP: один активний профіль (перший у БД).
 * Пізніше — auth + profileId з сесії.
 */
export async function getDefaultProfile() {
  return prisma.profile.findFirst({
    orderBy: { createdAt: "asc" },
    include: { trainingPreferences: true },
  });
}

export async function requireDefaultProfile() {
  const profile = await getDefaultProfile();
  if (!profile) {
    throw new ProfileNotFoundError();
  }
  return profile;
}

export class ProfileNotFoundError extends Error {
  constructor() {
    super("Профіль не знайдено. Створіть профіль через POST /api/profile");
    this.name = "ProfileNotFoundError";
  }
}
