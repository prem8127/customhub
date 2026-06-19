import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";

import { CustomizationStudio } from "@/components/customization-studio";
import { fetchProduct } from "@/lib/api";

export default async function CustomizePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const product = await fetchProduct(id);

    return (
      <div className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-10 lg:pb-14">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold text-brand"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Customize {product.name}
            </h1>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold text-brand"
          >
            <Store className="h-4 w-4" />
            View Storefront
          </Link>
        </div>
        <CustomizationStudio product={product} />
      </div>
    );
  } catch {
    return notFound();
  }
}
