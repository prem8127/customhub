"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AdminGuard } from "@/components/admin/admin-guard";
import { useAuth } from "@/components/auth-provider";
import { createAdminCategory, fetchCategories } from "@/lib/api";
import { ProductCategory } from "@/lib/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function loadCategories() {
    try {
      setCategories(await fetchCategories());
    } catch {
      setError("Unable to load categories.");
    }
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("Saving category...");

    if (!token) {
      setError("Admin login is required.");
      setStatus("");
      return;
    }

    try {
      await createAdminCategory(
        {
          name,
          slug: slug || slugify(name),
          description: description || undefined
        },
        token
      );
      setName("");
      setSlug("");
      setDescription("");
      setStatus("Category saved.");
      await loadCategories();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Category save failed.");
      setStatus("");
    }
  }

  return (
    <AdminGuard>
      <div className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 lg:px-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-steel">Admin catalog</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Categories</h1>
          </div>
          <Link href="/admin/products" className="rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold text-brand">
            Products
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          <form onSubmit={handleSubmit} className="premium-panel-strong rounded-[1.5rem] p-5">
            <h2 className="text-2xl font-semibold text-ink">Add category</h2>
            <div className="mt-5 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-brand">Name</span>
                <input
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setSlug(slugify(event.target.value));
                  }}
                  className="premium-input w-full rounded-xl px-4 py-3 outline-none"
                  required
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-brand">Slug</span>
                <input value={slug} onChange={(event) => setSlug(event.target.value)} className="premium-input w-full rounded-xl px-4 py-3 outline-none" required />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-brand">Description</span>
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="premium-input min-h-28 w-full resize-none rounded-xl px-4 py-3 outline-none" />
              </label>
              {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
              {status ? <p className="rounded-xl bg-white/70 px-4 py-3 text-sm text-brand">{status}</p> : null}
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white">
                <Plus className="h-4 w-4" />
                Save Category
              </button>
            </div>
          </form>

          <section className="premium-panel-strong overflow-hidden rounded-[1.5rem]">
            <div className="border-b border-line bg-white/60 px-5 py-4">
              <h2 className="text-xl font-semibold text-ink">Current categories</h2>
            </div>
            <div className="divide-y divide-[rgba(82,18,42,0.1)]">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="font-semibold text-ink">{category.name}</p>
                    <p className="mt-1 text-xs text-steel">{category.slug}</p>
                  </div>
                  <Link href={`/products?category=${encodeURIComponent(category.name)}`} className="rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-semibold text-brand">
                    View
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AdminGuard>
  );
}
