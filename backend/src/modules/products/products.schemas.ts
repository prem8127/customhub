import { z } from "zod";

export const productListSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    q: z.string().optional(),
    minPrice: z.coerce.number().int().optional(),
    maxPrice: z.coerce.number().int().optional(),
    sort: z.enum(["featured", "price-asc", "price-desc", "popularity"]).optional().default("featured")
  })
});

export const productDetailSchema = z.object({
  params: z.object({
    productId: z.string().min(1)
  })
});
