/**
 * Bulk product importer.
 *
 * Usage:
 *   1. Copy prisma/products-import.example.json -> prisma/products-import.json
 *   2. Fill it with your real products (array of objects, see example for shape).
 *   3. Run: npx tsx prisma/import-products.ts
 *
 * Safe to re-run: products are matched by `slug`. If a slug already exists,
 * it gets updated; otherwise a new product is created. Existing `thumbnail`
 * values are preserved if your JSON entry omits the field, so re-running
 * this after uploading real photos via the admin panel won't wipe them out.
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

type ImportProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  discountPrice?: number | null;
  stock?: number;
  thumbnail?: string | null;
  images?: string[];
  tags?: string[];
  popularity?: number;
  rating?: number;
  badge?: string;
  summary: string;
  description: string;
  turnaround?: string;
  features?: string[];
  materials?: string[];
  accent?: string;
  surface?: string;
  customizable?: boolean;
  art?: { base: string; glow: string; detail: string };
  visibilityStatus?: "visible" | "hidden";
  featured?: boolean;
};

function loadProducts(): ImportProduct[] {
  const filePath = path.join(__dirname, "products-import.json");

  if (!existsSync(filePath)) {
    console.error(
      `\nNo file found at prisma/products-import.json.\n` +
        `Copy prisma/products-import.example.json to prisma/products-import.json and fill it in first.\n`
    );
    process.exit(1);
  }

  const raw = readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    console.error("products-import.json must contain a JSON array of product objects.");
    process.exit(1);
  }

  return parsed;
}

function validate(product: ImportProduct, index: number) {
  const required: (keyof ImportProduct)[] = [
    "id",
    "slug",
    "name",
    "category",
    "price",
    "summary",
    "description"
  ];
  const missing = required.filter((key) => product[key] === undefined || product[key] === null || product[key] === "");
  if (missing.length > 0) {
    throw new Error(`Product at index ${index} (slug: ${product.slug ?? "?"}) is missing: ${missing.join(", ")}`);
  }
}

async function main() {
  const products = loadProducts();
  products.forEach((product, index) => validate(product, index));

  let created = 0;
  let updated = 0;

  for (const product of products) {
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });

    const baseData = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      title: product.name,
      category: product.category,
      brand: "CustomHub",
      price: product.price,
      discountPrice: product.discountPrice ?? null,
      originalPrice: product.originalPrice ?? null,
      stock: product.stock ?? 100,
      images: product.images ?? [],
      tags: product.tags ?? [product.category],
      visibilityStatus: product.visibilityStatus ?? "visible",
      featured: product.featured ?? false,
      popularity: product.popularity ?? 75,
      rating: product.rating ?? 4.5,
      badge: product.badge ?? "New",
      summary: product.summary,
      description: product.description,
      turnaround: product.turnaround ?? "Ships in 4-6 days",
      features: product.features ?? [],
      materials: product.materials ?? [],
      accent: product.accent ?? "#0EA5E9",
      surface: product.surface ?? "from-sky-200 via-sky-100 to-white",
      customizable: product.customizable ?? true,
      art: product.art ?? { base: "#eef2ff", glow: "rgba(99,102,241,0.25)", detail: "#312e81" }
    };

    if (existing) {
      await prisma.product.update({
        where: { slug: product.slug },
        data: {
          ...baseData,
          // Only overwrite thumbnail if explicitly provided in the JSON —
          // never blow away a real photo uploaded later via the admin panel.
          ...(product.thumbnail !== undefined ? { thumbnail: product.thumbnail } : {})
        }
      });
      updated += 1;
    } else {
      await prisma.product.create({
        data: { ...baseData, thumbnail: product.thumbnail ?? null }
      });
      created += 1;
    }
  }

  console.log(`\nImport complete: ${created} created, ${updated} updated, ${products.length} total.\n`);
}

main()
  .catch((error) => {
    console.error("Import failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
