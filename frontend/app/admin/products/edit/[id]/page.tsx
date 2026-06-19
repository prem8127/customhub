"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminProductForm } from "@/components/admin/admin-product-form";
import { useAuth } from "@/components/auth-provider";
import { fetchAdminProduct } from "@/lib/api";
import { Product } from "@/lib/types";

export default function EditAdminProductPage() {
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !params.id) {
      return;
    }

    void fetchAdminProduct(params.id, token)
      .then(setProduct)
      .catch(() => setError("Unable to load product."));
  }, [params.id, token]);

  return (
    <AdminGuard>
      <div className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 lg:px-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-steel">Admin catalog</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Edit product</h1>
          </div>
          <Link href="/admin/products" className="rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold text-brand">
            Back
          </Link>
        </div>
        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        {product ? <AdminProductForm product={product} /> : <p className="text-sm text-steel">Loading product...</p>}
      </div>
    </AdminGuard>
  );
}
