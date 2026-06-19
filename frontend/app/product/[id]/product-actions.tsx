"use client";

import { useRouter } from "next/navigation";

import { useCart } from "@/components/cart-provider";
import { Product } from "@/lib/types";

export function AddToCartButton({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();

  return (
    <button
      type="button"
      onClick={() => {
        addItem(product);
        router.push("/cart");
      }}
      className="rounded-full bg-gradient-to-r from-brand to-brandSoft px-5 py-3 text-sm font-semibold text-white"
    >
      Add to cart
    </button>
  );
}
