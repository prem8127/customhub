"use client";

import Link from "next/link";

import { useCart } from "@/components/cart-provider";
import { ProductVisual } from "@/components/product-visual";
import { currency } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, subtotal, updateQuantity } = useCart();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 pb-28 sm:px-10 lg:pb-16">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.34em] text-steel">Cart</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-ink">Review your picks</h1>
          <div className="mt-10 space-y-4">
            {items.length === 0 ? (
              <div className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-card">
                <p className="text-lg text-steel">Your cart is empty.</p>
                <Link
                  href="/products"
                  className="mt-6 inline-flex rounded-full bg-gradient-to-r from-brand to-brandSoft px-5 py-3 text-sm font-semibold text-white"
                >
                  Browse products
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-card"
                >
                  <div className="grid gap-5 sm:grid-cols-[11rem_1fr] sm:items-center">
                    <ProductVisual product={item.product} variant="cart" />
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-steel">{item.product.category}</p>
                        <h2 className="mt-2 text-2xl font-semibold text-ink">{item.product.name}</h2>
                        <p className="mt-2 text-sm text-steel">{currency.format(item.product.price)}</p>
                        {item.customization?.message ? (
                          <p className="mt-3 text-sm text-steel">
                            Custom text: <span className="font-medium text-ink">{item.customization.message}</span>
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={item.quantity}
                          onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                          className="rounded-full border border-line bg-slate-50 px-4 py-2"
                        >
                          {[1, 2, 3, 4, 5].map((count) => (
                            <option key={count}>{count}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded-full border border-line px-4 py-2 text-sm font-medium text-steel"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-white/70 bg-slate-950 p-7 text-white shadow-soft">
          <p className="text-xs uppercase tracking-[0.28em] text-white/60">Order summary</p>
          <div className="mt-6 space-y-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <div className="flex justify-between text-sm text-white/70">
              <span>Subtotal</span>
              <span>{currency.format(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-white/70">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-4 text-base font-semibold">
              <span>Total</span>
              <span>{currency.format(subtotal)}</span>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/checkout"
              className="rounded-full bg-gradient-to-r from-brand to-brandSoft px-5 py-3 text-sm font-semibold"
            >
              Proceed to checkout
            </Link>
            <Link
              href="/products"
              className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white/80"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
