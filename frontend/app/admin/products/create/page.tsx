"use client";

import Link from "next/link";

import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminProductForm } from "@/components/admin/admin-product-form";

export default function CreateAdminProductPage() {
  return (
    <AdminGuard>
      <div className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 lg:px-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-steel">Admin catalog</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Create product</h1>
          </div>
          <Link href="/admin/products" className="rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold text-brand">
            Back
          </Link>
        </div>
        <AdminProductForm />
      </div>
    </AdminGuard>
  );
}
