"use client";

import { CategoryCard, getCategoryCardTheme } from "@/components/CategoryCard";
import { Reveal } from "@/components/reveal";
import { CategoryHighlight } from "@/lib/types";

export function CategoryStrip({ categories }: { categories: CategoryHighlight[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {categories.map((category, index) => {
        const theme = getCategoryCardTheme(category.label);

        return (
          <Reveal key={category.label} delay={index * 0.06}>
            <CategoryCard
              title={category.label}
              description={category.description}
              image={theme.image}
              gradient={theme.gradient}
              imageFrameClassName={theme.imageFrameClassName}
              imageClassName={theme.imageClassName}
              href={`/products?category=${encodeURIComponent(category.label)}`}
              accent={category.accent}
              showcase
              priority={index < 4}
            />
          </Reveal>
        );
      })}
    </div>
  );
}
