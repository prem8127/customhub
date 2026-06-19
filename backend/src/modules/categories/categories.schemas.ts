import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    slug: z.string().min(2).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    description: z.string().max(500).optional()
  })
});
