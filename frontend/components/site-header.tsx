"use client";

import Link from "next/link";
import { Grid2x2, Search, ShoppingBag, UserRound } from "lucide-react";
import { useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { SearchSheet } from "@/components/search-sheet";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { itemCount } = useCart();
  const { user } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/90 backdrop-blur-2xl text-brand">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
          <BrandLogo
            priority
            showBadge24
            iconWrapClassName="h-12 w-12 md:h-12 md:w-12"
            imageClassName="h-full w-full object-cover"
            textClassName="text-[1.05rem] sm:text-[1.1rem] text-brand"
          />
          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/products" className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-brand">
              Products
            </Link>
            <Link href="/categories" className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-brand">
              Categories
            </Link>
            <Link href="/orders" className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-brand">
              Orders
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-brand transition hover:-translate-y-0.5 hover:bg-white/80"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link
              href="/products"
              className="hidden h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-brand transition hover:-translate-y-0.5 hover:bg-white/80 sm:inline-flex"
              aria-label="Browse products"
            >
              <Grid2x2 className="h-4 w-4" />
            </Link>
            <Link
              suppressHydrationWarning
              href={user ? "/account" : "/login"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-brand transition hover:-translate-y-0.5 hover:bg-white/80"
              aria-label={user ? "Customer account" : "Customer login"}
            >
              <UserRound className="h-4 w-4" />
            </Link>
            <Link
              href="/cart"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-brand transition hover:-translate-y-0.5 hover:bg-white/80"
            >
              <ShoppingBag className="h-4 w-4" />
              <span
                suppressHydrationWarning
                className={cn(
                  "absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white transition shadow-sm",
                  itemCount === 0 && "scale-0"
                )}
              >
                {itemCount}
              </span>
            </Link>
          </div>
        </div>
      </header>
      <SearchSheet
        open={searchOpen}
        query={query}
        onChange={setQuery}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
