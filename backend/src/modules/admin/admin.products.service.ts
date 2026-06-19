import crypto from "crypto";

import { Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../utils/http-error.js";
import { serializeProduct } from "../../utils/serializers.js";
import { persistProductImages } from "../uploads/upload.service.js";
import { adminProductInputSchema } from "./admin.schemas.js";

type ProductInput = Partial<Prisma.ProductCreateInput> & {
  uploadedImages?: Array<{ name?: string; dataUrl: string }>;
  images?: string[];
  tags?: string[];
  features?: string[];
  materials?: string[];
};
type AdminProductInput = z.infer<typeof adminProductInputSchema>;

function productIdFromSlug(slug: string) {
  return `${slug}-${crypto.randomBytes(3).toString("hex")}`;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

async function normalizeProductInput(input: Partial<AdminProductInput>) {
  const uploadedUrls = await persistProductImages(input.uploadedImages ?? []);
  const images = [...((input.images as string[] | undefined) ?? []), ...uploadedUrls];
  const thumbnail = input.thumbnail ?? images[0] ?? null;

  return {
    title: input.title,
    name: input.title,
    slug: input.slug,
    description: input.description,
    summary: input.summary ?? input.description,
    price: input.price,
    discountPrice: input.discountPrice ?? null,
    originalPrice: input.originalPrice ?? null,
    category: input.category,
    brand: input.brand ?? "CustomHub",
    stock: input.stock ?? 0,
    images,
    thumbnail,
    tags: input.tags ?? [],
    visibilityStatus: input.visibilityStatus ?? "visible",
    featured: input.featured ?? false,
    rating: input.rating ?? 4.5,
    popularity: input.popularity ?? 0,
    badge: input.badge ?? "New",
    turnaround: input.turnaround ?? "Ships in 4-6 days",
    features: input.features ?? [],
    materials: input.materials ?? [],
    accent: input.accent ?? "#8f1d48",
    surface: input.surface ?? "from-[#fceef2] via-[#fff8fa] to-[#f6dce5]",
    customizable: input.customizable ?? true,
    art: (input.art ?? {}) as Prisma.InputJsonValue
  };
}

export async function createAdminProduct(input: unknown) {
  const parsed = adminProductInputSchema.parse(input);
  const data = await normalizeProductInput(parsed);

  const product = await prisma.product.create({
    data: {
      id: productIdFromSlug(parsed.slug),
      ...data,
      title: data.title ?? parsed.title,
      name: data.name ?? parsed.title,
      slug: parsed.slug,
      description: data.description ?? parsed.description,
      price: data.price ?? parsed.price,
      category: data.category ?? parsed.category,
      summary: data.summary ?? parsed.summary ?? parsed.description
    }
  });

  return serializeProduct(product);
}

export async function updateAdminProduct(productId: string, input: unknown) {
  const existing = await prisma.product.findFirst({
    where: { OR: [{ id: productId }, { slug: productId }] }
  });

  if (!existing) {
    throw new HttpError(404, "Product not found.", "PRODUCT_NOT_FOUND");
  }

  const parsed = adminProductInputSchema.partial().parse(input);
  const normalized = await normalizeProductInput({
    title: existing.title ?? existing.name,
    slug: existing.slug,
    description: existing.description,
    summary: existing.summary,
    price: existing.price,
    discountPrice: existing.discountPrice,
    originalPrice: existing.originalPrice,
    category: existing.category,
    brand: existing.brand ?? "CustomHub",
    stock: existing.stock,
    visibilityStatus: existing.visibilityStatus as AdminProductInput["visibilityStatus"],
    featured: existing.featured,
    rating: existing.rating,
    popularity: existing.popularity,
    badge: existing.badge,
    turnaround: existing.turnaround,
    features: stringArray(existing.features),
    materials: stringArray(existing.materials),
    accent: existing.accent,
    surface: existing.surface,
    customizable: existing.customizable,
    art: typeof existing.art === "object" && existing.art ? (existing.art as Record<string, unknown>) : {},
    ...parsed,
    images: parsed.images ?? stringArray(existing.images),
    tags: parsed.tags ?? stringArray(existing.tags),
    uploadedImages: parsed.uploadedImages
  });

  const product = await prisma.product.update({
    where: { id: existing.id },
    data: normalized as Prisma.ProductUpdateInput
  });

  return serializeProduct(product);
}

export async function deleteAdminProduct(productId: string) {
  const existing = await prisma.product.findFirst({
    where: { OR: [{ id: productId }, { slug: productId }] }
  });

  if (!existing) {
    throw new HttpError(404, "Product not found.", "PRODUCT_NOT_FOUND");
  }

  await prisma.product.delete({ where: { id: existing.id } });
  return { deleted: true };
}
