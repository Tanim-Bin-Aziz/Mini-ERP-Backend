import { z } from "zod";

export const revenueTrendQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    days: z.string().regex(/^\d+$/, "days must be a number").optional(),
  }),
});
