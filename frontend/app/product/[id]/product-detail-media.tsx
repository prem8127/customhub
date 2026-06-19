"use client";

import { Product360Viewer } from "@/components/premium/Product360Viewer";
import { ProductVisual } from "@/components/product-visual";
import { Product } from "@/lib/types";
import { Product360Frame } from "@/lib/premium-types";

type ProductDetailMediaProps = {
  product: Product;
  frames: Product360Frame[];
};

export function ProductDetailMedia({ product, frames }: ProductDetailMediaProps) {
  return (
    <div className="space-y-6">
      <ProductVisual product={product} variant="detail" />
      {frames.length > 0 ? (
        <Product360Viewer
          images={frames}
          alt={`${product.name} 360 degree view`}
          className="bg-white/82"
        />
      ) : null}
    </div>
  );
}
