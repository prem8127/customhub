"use client";

import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { CategoryIconRow } from "@/components/CategoryIconRow";
import { ProductCard } from "@/components/product-card";
import { Category, Product, categories } from "@/lib/types";

type ProductCatalogProps = {
  products: Product[];
  defaultCategory?: string;
};

export function ProductCatalog({ products, defaultCategory }: ProductCatalogProps) {
  const minAvailablePrice = useMemo(
    () => products.reduce((min, product) => Math.min(min, product.price), Number.POSITIVE_INFINITY),
    [products]
  );
  const maxAvailablePrice = useMemo(
    () => products.reduce((max, product) => Math.max(max, product.price), 0),
    [products]
  );

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">(
    defaultCategory && categories.includes(defaultCategory as Category)
      ? (defaultCategory as Category)
      : "All"
  );
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(maxAvailablePrice);

  useEffect(() => {
    setMaxPrice(maxAvailablePrice);
  }, [maxAvailablePrice]);

  const resetFilters = () => {
    setQuery("");
    setCategory("All");
    setSort("featured");
    setMaxPrice(maxAvailablePrice);
  };

  const filtered = useMemo(() => {
    let next = [...products];

    if (category !== "All") {
      next = next.filter((product) => product.category === category);
    }

    if (query) {
      const search = query.toLowerCase();
      next = next.filter((product) =>
        [product.name, product.category, product.summary].some((value) =>
          value.toLowerCase().includes(search)
        )
      );
    }

    next = next.filter((product) => product.price <= maxPrice);

    switch (sort) {
      case "price-asc":
        next.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        next.sort((a, b) => b.price - a.price);
        break;
      case "popularity":
        next.sort((a, b) => b.popularity - a.popularity);
        break;
      default:
        next.sort((a, b) => b.rating - a.rating);
    }

    return next;
  }, [category, maxPrice, products, query, sort]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-card backdrop-blur lg:grid-cols-[1.25fr_repeat(3,0.75fr)]">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.24em] text-steel">Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products"
            className="w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 outline-none ring-0 transition focus:border-brand"
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.24em] text-steel">Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as Category | "All")}
            className="w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 outline-none"
          >
            <option>All</option>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.24em] text-steel">Sort</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 outline-none"
          >
            <option value="featured">Featured</option>
            <option value="popularity">Popularity</option>
            <option value="price-asc">Price: Low to high</option>
            <option value="price-desc">Price: High to low</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.24em] text-steel">
            Max price: Rs {maxPrice}
          </span>
          <input
            type="range"
            min={Number.isFinite(minAvailablePrice) ? minAvailablePrice : 0}
            max={maxAvailablePrice}
            step={100}
            value={maxPrice}
            onChange={(event) => setMaxPrice(Number(event.target.value))}
            className="mt-4 w-full accent-brand"
          />
        </label>
      </section>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-steel">Catalog</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[0.04em] text-ink">
            Refined custom products
          </h2>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-line bg-white/80 px-4 py-2 text-sm text-steel sm:flex">
          <SlidersHorizontal className="h-4 w-4" />
          {filtered.length} of {products.length} products
        </div>
      </div>

      <CategoryIconRow selectedCategory={category} onSelectCategory={setCategory} />

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} className="h-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.8rem] border border-dashed border-line bg-white/70 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-steel">No products found</p>
          <p className="mt-3 text-base text-steel">
            Try changing search or filters to see all available products.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
