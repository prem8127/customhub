import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { env } from "../src/config/env.js";
import { buildSeedProducts } from "../src/data/products.js";

const prisma = new PrismaClient();

async function main() {
  const products = buildSeedProducts();

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        slug: product.slug,
        name: product.name,
        title: product.name,
        category: product.category,
        brand: "CustomHub",
        price: product.price,
        discountPrice: product.originalPrice ?? null,
        originalPrice: product.originalPrice ?? null,
        stock: 100,
        images: [],
        // Update thumbnail only if it is still an old SVG placeholder
        // (i.e. no real admin-uploaded photo has been set yet).
        thumbnail: product.thumbnail ?? null,
        tags: [product.category],
        visibilityStatus: "visible",
        featured: product.popularity >= 90,
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
        art: product.art
      },
      create: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        title: product.name,
        category: product.category,
        brand: "CustomHub",
        price: product.price,
        discountPrice: product.originalPrice ?? null,
        originalPrice: product.originalPrice ?? null,
        stock: 100,
        images: [],
        thumbnail: product.thumbnail ?? null,
        tags: [product.category],
        visibilityStatus: "visible",
        featured: product.popularity >= 90,
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
        art: product.art
      }
    });
  }

  const categories = [...new Set(products.map((product) => product.category))];
  for (const category of categories) {
    const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    await prisma.category.upsert({
      where: { name: category },
      update: { slug },
      create: { name: category, slug }
    });
  }

  if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    await prisma.user.upsert({
      where: { email: env.ADMIN_EMAIL },
      update: { role: "admin" },
      create: {
        name: env.ADMIN_NAME,
        email: env.ADMIN_EMAIL,
        passwordHash: await bcrypt.hash(env.ADMIN_PASSWORD, 12),
        avatar: "AD",
        role: "admin",
        addresses: []
      }
    });
  }

  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });