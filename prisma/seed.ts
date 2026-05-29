import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BUILTIN_EXERCISES = [
  { name: "Жим штанги лежачи", category: "CHEST" as const, equipment: "BARBELL" as const },
  { name: "Жим гантелей на похилій", category: "CHEST" as const, equipment: "DUMBBELL" as const },
  { name: "Віджимання", category: "CHEST" as const, equipment: "BODYWEIGHT" as const },
  { name: "Зведення в кросовері", category: "CHEST" as const, equipment: "CABLE" as const },
  { name: "Підтягування", category: "BACK" as const, equipment: "BODYWEIGHT" as const },
  { name: "Тяга штанги в нахилі", category: "BACK" as const, equipment: "BARBELL" as const },
  { name: "Тяга верхнього блоку", category: "BACK" as const, equipment: "CABLE" as const },
  { name: "Станова тяга", category: "BACK" as const, equipment: "BARBELL" as const },
  { name: "Тяга гантелі в нахилі", category: "BACK" as const, equipment: "DUMBBELL" as const },
  { name: "Присідання зі штангою", category: "LEGS" as const, equipment: "BARBELL" as const },
  { name: "Жим ногами", category: "LEGS" as const, equipment: "MACHINE" as const },
  { name: "Румунська станова", category: "LEGS" as const, equipment: "BARBELL" as const },
  { name: "Випади з гантелями", category: "LEGS" as const, equipment: "DUMBBELL" as const },
  { name: "Згинання ніг у тренажері", category: "LEGS" as const, equipment: "MACHINE" as const },
  { name: "Підйом на носки", category: "LEGS" as const, equipment: "MACHINE" as const },
  { name: "Жим штанги стоячи", category: "SHOULDERS" as const, equipment: "BARBELL" as const },
  { name: "Жим гантелей сидячи", category: "SHOULDERS" as const, equipment: "DUMBBELL" as const },
  { name: "Махи гантелей в сторони", category: "SHOULDERS" as const, equipment: "DUMBBELL" as const },
  { name: "Face pull", category: "SHOULDERS" as const, equipment: "CABLE" as const },
  { name: "Підйом на біцепс (штанга)", category: "ARMS" as const, equipment: "BARBELL" as const },
  { name: "Молоткові згинання", category: "ARMS" as const, equipment: "DUMBBELL" as const },
  { name: "Трицепс на блоці", category: "ARMS" as const, equipment: "CABLE" as const },
  { name: "Французький жим", category: "ARMS" as const, equipment: "BARBELL" as const },
  { name: "Планка", category: "CORE" as const, equipment: "BODYWEIGHT" as const },
  { name: "Скручування", category: "CORE" as const, equipment: "BODYWEIGHT" as const },
  { name: "Скручування на блоці", category: "CORE" as const, equipment: "CABLE" as const },
];

async function main() {
  const existingProfile = await prisma.profile.findFirst();
  if (!existingProfile) {
    const profile = await prisma.profile.create({
      data: {
        name: "Користувач",
        trainingPreferences: { create: {} },
      },
    });
    console.log(`✅ Профіль: ${profile.id}`);
  }

  for (const ex of BUILTIN_EXERCISES) {
    const exists = await prisma.exercise.findFirst({
      where: { name: ex.name, profileId: null, isCustom: false },
    });
    if (!exists) {
      await prisma.exercise.create({
        data: { ...ex, isCustom: false, profileId: null },
      });
    }
  }

  console.log(`✅ Seed: ${BUILTIN_EXERCISES.length} вправ`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
