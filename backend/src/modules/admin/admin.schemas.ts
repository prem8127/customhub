import { z } from "zod";

const imageUploadSchema = z.object({
  name: z.string().max(180).optional(),
  dataUrl: z.string().min(32)
});

export const adminProductInputSchema = z.object({
  title: z.string().min(2).max(160),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().min(8),
  summary: z.string().min(8).max(500).optional(),
  price: z.coerce.number().int().nonnegative(),
  discountPrice: z.coerce.number().int().nonnegative().nullable().optional(),
  originalPrice: z.coerce.number().int().nonnegative().nullable().optional(),
  category: z.string().min(2).max(120),
  brand: z.string().max(120).optional().default("CustomHub"),
  stock: z.coerce.number().int().nonnegative().default(0),
  images: z.array(z.string().url().or(z.string().startsWith("/uploads/"))).optional().default([]),
  thumbnail: z.string().url().or(z.string().startsWith("/uploads/")).nullable().optional(),
  uploadedImages: z.array(imageUploadSchema).optional().default([]),
  tags: z.array(z.string().min(1).max(40)).optional().default([]),
  visibilityStatus: z.enum(["visible", "hidden", "draft"]).default("visible"),
  featured: z.coerce.boolean().default(false),
  rating: z.coerce.number().min(0).max(5).default(4.5),
  popularity: z.coerce.number().int().min(0).max(100).default(0),
  badge: z.string().max(80).optional().default("New"),
  turnaround: z.string().max(80).optional().default("Ships in 4-6 days"),
  features: z.array(z.string().min(1).max(120)).optional().default([]),
  materials: z.array(z.string().min(1).max(120)).optional().default([]),
  accent: z.string().max(16).optional().default("#8f1d48"),
  surface: z.string().max(120).optional().default("from-[#fceef2] via-[#fff8fa] to-[#f6dce5]"),
  customizable: z.coerce.boolean().default(true),
  art: z.record(z.unknown()).optional().default({})
});

export const createAdminProductSchema = z.object({
  body: adminProductInputSchema
});

export const updateAdminProductSchema = z.object({
  params: z.object({ productId: z.string().min(1) }),
  body: adminProductInputSchema.partial().refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required."
  })
});

export const deleteAdminProductSchema = z.object({
  params: z.object({ productId: z.string().min(1) })
});
