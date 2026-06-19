import Link from "next/link";

import { CategoryCard, getCategoryCardTheme } from "@/components/CategoryCard";
import { fetchCategories } from "@/lib/api";

export default async function CategoriesPage() {
  const categories = await fetchCategories();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 pb-28 sm:px-10 lg:pb-16">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.34em] text-steel">Categories</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-ink">Choose your product family</h1>
        <p className="mt-5 text-lg leading-8 text-steel">
          Product families are loaded from the backend catalog and update as admins add categories.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category, index) => {
          const theme = getCategoryCardTheme(category.name);

          return (
            <CategoryCard
              key={category.id}
              title={category.name}
              description={category.description ?? "Custom-ready products with polished materials and finish options."}
              image={theme.image}
              gradient={theme.gradient}
              imageFrameClassName={theme.imageFrameClassName}
              imageClassName={theme.imageClassName}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              accent="#8f1d48"
              showcase
              priority={index < 4}
            />
          );
        })}
      </div>

      <div className="mt-10 flex items-center justify-between gap-4 rounded-[2rem] border border-white/70 bg-white/60 px-6 py-4 backdrop-blur">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-steel">Category browse</p>
          <p className="mt-2 text-sm text-steel">
            Pick any box to jump straight into that collection.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex shrink-0 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          View all products
        </Link>
      </div>
    </div>
  );
}
