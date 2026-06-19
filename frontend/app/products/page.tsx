import { fetchProducts } from "@/lib/api";

import { ProductCatalog } from "@/components/product-catalog";

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const products = await fetchProducts();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 pb-28 sm:px-10 lg:pb-16">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.34em] text-steel">Product listing</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-ink">
          Premium custom products, filtered your way.
        </h1>
        <p className="mt-5 text-lg leading-8 text-steel">
          Search, sort and refine across apparel, accessories and daily-carry essentials.
        </p>
      </div>
      <div className="mt-10">
        <ProductCatalog products={products} defaultCategory={params.category} />
      </div>
    </div>
  );
}
