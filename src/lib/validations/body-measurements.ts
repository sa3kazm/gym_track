import { z } from "zod";

const cm = z.coerce.number().min(10).max(250).nullable().optional();

export const bodyMeasurementsSchema = z.object({
  wristCm: cm,
  neckCm: cm,
  chestCm: cm,
  waistCm: cm,
  hipsCm: cm,
  bicepCm: cm,
  forearmCm: cm,
  thighCm: cm,
  calfCm: cm,
});

export type BodyMeasurementsPayload = z.infer<typeof bodyMeasurementsSchema>;
