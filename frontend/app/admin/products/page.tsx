"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";

import { AdminGuard } from "@/components/admin/admin-guard";
import { useAuth } from "@/components/auth-provider";
import { deleteAdminProduct, fetchAdminProducts } from "@/lib/api";
import { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts() {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      setProducts(await fetchAdminProducts(token));
    } catch {
      setError("Unable to load admin products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, [token]);

  const filtered = useMemo(() => {
    const search = query.toLowerCase();
    return products.filter((product) =>
      [product.name, product.slug, product.category, product.brand ?? ""].some((value) =>
        value.toLowerCase().includes(search)
      )
    );
  }, [products, query]);

  async function handleDelete(product: Product) {
    if (!token || !confirm(`Delete ${product.name}?`)) {
      return;
    }

    await deleteAdminProduct(product.id, token);
    setProducts((current) => current.filter((item) => item.id !== product.id));
  }

  return (
    <AdminGuard>
      <div className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-steel">Admin catalog</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Products</h1>
          </div>
          <Link href="/admin/products/create" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
          <Link href="/admin/categories" className="inline-flex items-center justify-center rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold text-brand">
            Categories
          </Link>
        </div>

        <section className="premium-panel-strong mt-6 rounded-[1.5rem] p-4">
          <label className="flex items-center gap-3 rounded-xl border border-line bg-white/70 px-4 py-3">
            <Search className="h-4 w-4 text-steel" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="w-full bg-transparent outline-none" />
          </label>
        </section>

        <section className="premium-panel-strong mt-5 overflow-hidden rounded-[1.5rem]">
          {loading ? (
            <p className="p-6 text-sm text-steel">Loading products...</p>
          ) : error ? (
            <p className="p-6 text-sm text-red-700">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-white/70 text-xs uppercase tracking-[0.2em] text-steel">
                  <tr>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Price</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4">Visibility</th>
                    <th className="px-5 py-4">Featured</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(82,18,42,0.1)]">
                  {filtered.map((product) => (
                    <tr key={product.id} className="bg-white/35">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-ink">{product.name}</p>
                        <p className="mt-1 text-xs text-steel">{product.slug}</p>
                      </td>
                      <td className="px-5 py-4 text-brand">{product.category}</td>
                      <td className="px-5 py-4 font-semibold text-ink">₹{product.price}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${Number(product.stock ?? 0) > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                          {product.stock ?? 0} in stock
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand">
                          {product.visibilityStatus ?? "visible"}
                        </span>
                      </td>
                      <td className="px-5 py-4">{product.featured ? "Yes" : "No"}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/products/edit/${product.id}`} className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-brand">
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button type="button" onClick={() => void handleDelete(product)} className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminGuard>
  );
}
