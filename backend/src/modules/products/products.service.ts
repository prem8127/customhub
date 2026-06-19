import { Prisma } from "@prisma/client";

import { buildSeedProducts } from "../../data/products.js";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../utils/http-error.js";
import { serializeProduct } from "../../utils/serializers.js";

type ProductQuery = {
  category?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "featured" | "price-asc" | "price-desc" | "popularity";
  includeHidden?: boolean;
};

function isDatabaseUnavailable(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Error &&
      /Can't reach database server|ECONNREFUSED|connection.*refused|database server/i.test(error.message))
  );
}

function createFallbackProduct(product: {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  popularity: number;
  rating: number;
  badge: string;
  summary: string;
  description: string;
  turnaround: string;
  features: string[];
  materials: string[];
  accent: string;
  surface: string;
  customizable: boolean;
  thumbnail?: string | null;
  art: {
    base: string;
    glow: string;
    detail: string;
  };
}) {
  const fallbackProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    title: product.name,
    category: product.category,
    brand: "",
    price: product.price,
    discountPrice: product.originalPrice ? Math.max(product.price - 150, 0) : null,
    originalPrice: product.originalPrice ?? null,
    stock: 999,
    images: [],
    thumbnail: product.thumbnail ?? null,
    tags: [],
    visibilityStatus: "visible" as const,
    featured: product.badge.toLowerCase().includes("best") || product.badge === "New",
    popularity: product.popularity,
    rating: product.rating,
    badge: product.badge,
    summary: product.summary,
    description: product.description,
    turnaround: product.turnaround,
    features: product.features,
    materials: product.materials,
    accent: product.accent,
    surface: product.surface,
    customizable: product.customizable,
    art: product.art,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return serializeProduct(fallbackProduct);
}

export async function listProducts(query: ProductQuery) {
  const where: Prisma.ProductWhereInput = query.includeHidden ? {} : { visibilityStatus: "visible" };

  if (query.category) {
    where.category = query.category;
  }

  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { title: { contains: query.q, mode: "insensitive" } },
      { brand: { contains: query.q, mode: "insensitive" } },
      { category: { contains: query.q, mode: "insensitive" } },
      { summary: { contains: query.q, mode: "insensitive" } }
    ];
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {
      gte: query.minPrice,
      lte: query.maxPrice
    };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    query.sort === "price-asc"
      ? [{ price: "asc" }]
      : query.sort === "price-desc"
        ? [{ price: "desc" }]
        : query.sort === "popularity"
          ? [{ popularity: "desc" }]
          : [{ rating: "desc" }, { popularity: "desc" }];

  try {
    const products = await prisma.product.findMany({ where, orderBy });
    return products.map(serializeProduct);
  } catch (error) {
    if (!isDatabaseUnavailable(error)) {
      throw error;
    }

    const seedProducts = buildSeedProducts();
    const filteredProducts = seedProducts
      .filter((product) => {
        if (query.category && product.category !== query.category) {
          return false;
        }

        if (query.q) {
          const needle = query.q.toLowerCase();
          const haystack = [product.name, product.category, product.summary, product.description]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(needle)) {
            return false;
          }
        }

        if (query.minPrice !== undefined && product.price < query.minPrice) {
          return false;
        }

        if (query.maxPrice !== undefined && product.price > query.maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (query.sort === "price-asc") {
          return a.price - b.price;
        }
        if (query.sort === "price-desc") {
          return b.price - a.price;
        }
        if (query.sort === "popularity") {
          return b.popularity - a.popularity;
        }
        return b.rating - a.rating || b.popularity - a.popularity;
      });

    return filteredProducts.map(createFallbackProduct);
  }
}

export async function getProduct(productId: string, options: { includeHidden?: boolean } = {}) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: productId }, { slug: productId }],
        ...(options.includeHidden ? {} : { visibilityStatus: "visible" })
      }
    });

    if (!product) {
      throw new HttpError(404, "Product not found.", "PRODUCT_NOT_FOUND");
    }

    return serializeProduct(product);
  } catch (error) {
    if (!isDatabaseUnavailable(error)) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw error;
    }

    const seedProducts = buildSeedProducts();
    const product = seedProducts.find((item) => item.id === productId || item.slug === productId);

    if (!product) {
      throw new HttpError(404, "Product not found.", "PRODUCT_NOT_FOUND");
    }

    return createFallbackProduct(product);
  }
}
