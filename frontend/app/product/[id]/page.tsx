import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchProduct } from "@/lib/api";
import { FEATURES } from "@/lib/features";
import { getProduct360Frames } from "@/lib/premium-assets";
import { currency } from "@/lib/utils";

import { AddToCartButton } from "./product-actions";
import { ProductDetailMedia } from "./product-detail-media";

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const product = await fetchProduct(id);
    const frames = FEATURES.product360 ? getProduct360Frames(product.slug) : [];

    return (
      <div className="mx-auto max-w-7xl px-6 py-12 pb-28 sm:px-10 lg:pb-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <ProductDetailMedia product={product} frames={frames} />
          <div className="space-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-steel">{product.category}</p>
              <h1 className="mt-4 text-5xl font-semibold tracking-tight text-ink">{product.name}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-steel">{product.description}</p>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-card">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-steel">Starting at</p>
                  <p className="mt-2 text-4xl font-semibold text-ink">{currency.format(product.price)}</p>
                </div>
                <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  {product.turnaround}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <AddToCartButton product={product} />
                {product.customizable ? (
                  <Link
                    href={`/customize/${product.slug}`}
                    className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink"
                  >
                    Customize
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-card">
                <p className="text-xs uppercase tracking-[0.28em] text-steel">Features</p>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-ink">
                  {product.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-card">
                <p className="text-xs uppercase tracking-[0.28em] text-steel">Materials</p>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-ink">
                  {product.materials.map((material) => (
                    <li key={material}>{material}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    return notFound();
  }
}
