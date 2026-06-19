import { z } from "zod";

export const uploadDesignSchema = z.object({
  body: z.object({
    productId: z.string().min(1).optional(),
    previewDataUrl: z.string().min(1, "previewDataUrl is required."),
    message: z.string().optional()
  })
});

export const previewDesignSchema = z.object({
  body: z.object({
    productId: z.string().min(1).optional(),
    text: z.string().optional(),
    asset: z.string().optional()
  })
});
