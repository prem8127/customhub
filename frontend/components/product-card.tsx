"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { ProductVisual } from "@/components/product-visual";
import { Product } from "@/lib/types";
import { cn, currency } from "@/lib/utils";

export function ProductCard({
  product,
  className,
  compact = false
}: {
  product: Product;
  className?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <motion.article
        whileHover={{ y: -8, scale: 1.01 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "group overflow-hidden rounded-[2.1rem] border border-white/80 bg-[rgba(255,250,251,0.84)] p-4 shadow-[0_18px_46px_rgba(82,18,42,0.1)] backdrop-blur-xl",
          className
        )}
      >
        <Link href={`/product/${product.slug}`} className="flex h-full min-h-0 flex-col gap-3">
          <ProductVisual product={product} variant="compact" showOverlayText={false} />
          <div className="flex min-h-0 flex-1 flex-col px-1 pb-0.5">
            <p className="text-[10px] uppercase tracking-[0.22em] text-steel">{product.category}</p>
            <h3 className="mt-1 line-clamp-2 min-h-[2.05rem] text-[0.98rem] font-semibold leading-[1.08] text-ink">
              {product.name}
            </h3>
            <p className="mt-auto pt-2 text-lg font-extrabold leading-tight text-ink sm:text-xl">
              {currency.format(product.price)}
            </p>
          </div>
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.article
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "group overflow-hidden rounded-[2.1rem] border border-white/80 bg-[rgba(255,250,251,0.84)] p-4 shadow-[0_18px_46px_rgba(82,18,42,0.1)] backdrop-blur-xl",
        className
      )}
    >
      <Link href={`/product/${product.slug}`} className="flex h-full flex-col gap-4">
        <ProductVisual product={product} />
        <div className="flex flex-1 flex-col px-1 pb-1">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.3em] text-steel">{product.category}</p>
              <h3 className="mt-2 line-clamp-2 text-xl font-semibold leading-tight text-ink">
                {product.name}
              </h3>
            </div>
            <span className="shrink-0 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-xs font-semibold text-brand shadow-sm">
              {product.badge}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-steel">{product.summary}</p>
          <div className="mt-auto flex items-center justify-between pt-3">
            <p className="text-xl font-semibold leading-none text-ink">{currency.format(product.price)}</p>
            <span className="text-sm font-medium text-brand transition group-hover:translate-x-1">
              View product
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
