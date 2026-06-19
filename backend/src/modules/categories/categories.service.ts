import { prisma } from "../../db/prisma.js";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function listCategories() {
  const explicit = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const productCategories = await prisma.product.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" }
  });

  const merged = new Map<string, { id: string; name: string; slug: string; description?: string | null }>();

  productCategories.forEach((category) => {
    merged.set(category.category, {
      id: slugify(category.category),
      name: category.category,
      slug: slugify(category.category),
      description: null
    });
  });

  explicit.forEach((category) => merged.set(category.name, category));
  return [...merged.values()];
}

export async function createCategory(input: { name: string; slug?: string; description?: string }) {
  return prisma.category.upsert({
    where: { name: input.name },
    update: {
      slug: input.slug ?? slugify(input.name),
      description: input.description
    },
    create: {
      name: input.name,
      slug: input.slug ?? slugify(input.name),
      description: input.description
    }
  });
}
