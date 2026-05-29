import { z } from "zod";

export const genderSchema = z.enum(["MALE", "FEMALE", "OTHER"]);
export const goalSchema = z.enum(["LOSS", "GAIN", "MAINTAIN"]);
export const activityLevelSchema = z.enum([
  "SEDENTARY",
  "LIGHT",
  "MODERATE",
  "ACTIVE",
  "VERY_ACTIVE",
]);
export const exerciseCategorySchema = z.enum([
  "CHEST",
  "BACK",
  "LEGS",
  "SHOULDERS",
  "ARMS",
  "CORE",
  "OTHER",
]);
export const equipmentSchema = z.enum([
  "BARBELL",
  "DUMBBELL",
  "CABLE",
  "MACHINE",
  "BODYWEIGHT",
  "OTHER",
]);
export const weightUnitSchema = z.enum(["KG", "LB"]);
