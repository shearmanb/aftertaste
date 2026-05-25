import { z } from "zod";

export const OutsideCupSchema = z.object({
  location: z.string().min(1).max(200),
  locationNote: z.string().max(500).optional().nullable(),
  visitedAt: z.string().datetime().optional(),
  method: z.string().min(1).max(100),
  beanId: z.string().optional().nullable(),
  overallScore: z.number().min(0).max(10).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const OutsideCupPatchSchema = OutsideCupSchema.partial();
