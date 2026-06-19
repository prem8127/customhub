"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { fetchProducts } from "@/lib/api";
import { Product } from "@/lib/types";
import { currency } from "@/lib/utils";

type SearchSheetProps = {
  open: boolean;
  query: string;
  onClose: () => void;
  onChange: (value: string) => void;
};

export function SearchSheet({ open, query, onClose, onChange }: SearchSheetProps) {
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void fetchProducts({ q: query }).then(setResults).catch(() => setResults([]));
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [open, query]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(35,10,21,0.54)] p-4 backdrop-blur-sm">
      <div className="mx-auto mt-16 max-w-2xl overflow-hidden rounded-[2rem] border border-white/70 bg-[rgba(255,250,251,0.96)] shadow-[0_28px_80px_rgba(35,10,21,0.22)]">
        <div className="flex items-center gap-3 border-b border-white/70 px-5 py-4">
          <Search className="h-5 w-5 text-brand" />
          <input
            autoFocus
            value={query}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Search custom products, accessories and merch"
            className="w-full bg-transparent text-base outline-none placeholder:text-steel"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/70 bg-white/80 p-2 text-brand transition hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {results.length === 0 ? (
            <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-8 text-center text-sm text-steel">
              No products matched your search.
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-[1.5rem] border border-white/70 bg-white/85 px-4 py-4 transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-steel">{product.category}</p>
                    <p className="mt-1 text-base font-semibold text-ink">{product.name}</p>
                  </div>
                  <p className="text-sm font-medium text-ink">{currency.format(product.price)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
