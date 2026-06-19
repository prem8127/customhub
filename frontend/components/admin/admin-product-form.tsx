"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Upload } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { assetUrl, createAdminProduct, updateAdminProduct } from "@/lib/api";
import { Product, ProductInput } from "@/lib/types";

type AdminProductFormProps = {
  product?: Product;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function csv(value?: string[]) {
  return value?.join(", ") ?? "";
}

function lines(value?: string[]) {
  return value?.join("\n") ?? "";
}

export function AdminProductForm({ product }: AdminProductFormProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [title, setTitle] = useState(product?.title ?? product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [summary, setSummary] = useState(product?.summary ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [discountPrice, setDiscountPrice] = useState(String(product?.discountPrice ?? product?.originalPrice ?? ""));
  const [category, setCategory] = useState(product?.category ?? "T-shirts");
  const [brand, setBrand] = useState(product?.brand ?? "CustomHub");
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [tags, setTags] = useState(csv(product?.tags));
  const [features, setFeatures] = useState(lines(product?.features));
  const [materials, setMaterials] = useState(lines(product?.materials));
  const [visibilityStatus, setVisibilityStatus] = useState<ProductInput["visibilityStatus"]>(
    product?.visibilityStatus ?? "visible"
  );
  const [featured, setFeatured] = useState(Boolean(product?.featured));
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploadedImages, setUploadedImages] = useState<ProductInput["uploadedImages"]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const previews = useMemo(
    () => [...images, ...(uploadedImages?.map((image) => image.dataUrl) ?? [])],
    [images, uploadedImages]
  );

  async function handleFiles(files: FileList | null) {
    if (!files) {
      return;
    }

    const next = await Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise<{ name: string; dataUrl: string }>((resolve, reject) => {
            if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 4 * 1024 * 1024) {
              reject(new Error("Only PNG, JPEG, or WEBP images under 4MB are allowed."));
              return;
            }

            const reader = new FileReader();
            reader.onload = () => resolve({ name: file.name, dataUrl: String(reader.result) });
            reader.onerror = () => reject(new Error("Image read failed."));
            reader.readAsDataURL(file);
          })
      )
    );

    setUploadedImages((current) => [...(current ?? []), ...next]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("Saving product...");

    if (!token) {
      setError("Admin login is required.");
      setStatus("");
      return;
    }

    const payload: ProductInput = {
      title,
      slug: slug || slugify(title),
      description,
      summary,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      originalPrice: discountPrice ? Number(discountPrice) : null,
      category,
      brand,
      stock: Number(stock),
      images,
      uploadedImages,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      visibilityStatus,
      featured,
      rating: product?.rating ?? 4.5,
      popularity: product?.popularity ?? 0,
      badge: product?.badge ?? "New",
      turnaround: product?.turnaround ?? "Ships in 4-6 days",
      features: features.split("\n").map((feature) => feature.trim()).filter(Boolean),
      materials: materials.split("\n").map((material) => material.trim()).filter(Boolean),
      accent: product?.accent ?? "#8f1d48",
      surface: product?.surface ?? "from-[#fceef2] via-[#fff8fa] to-[#f6dce5]",
      customizable: product?.customizable ?? true,
      art: product?.art ?? {}
    };

    try {
      const saved = product
        ? await updateAdminProduct(product.id, payload, token)
        : await createAdminProduct(payload, token);
      setStatus("Product saved successfully.");
      router.push(`/admin/products/edit/${saved.id}`);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Product save failed.");
      setStatus("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <section className="premium-panel-strong space-y-5 rounded-[1.5rem] p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand">Title</span>
            <input value={title} onChange={(event) => {
              setTitle(event.target.value);
              if (!product) setSlug(slugify(event.target.value));
            }} className="premium-input w-full rounded-xl px-4 py-3 outline-none" required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand">Slug</span>
            <input value={slug} onChange={(event) => setSlug(event.target.value)} className="premium-input w-full rounded-xl px-4 py-3 outline-none" required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand">Category</span>
            <input value={category} onChange={(event) => setCategory(event.target.value)} className="premium-input w-full rounded-xl px-4 py-3 outline-none" required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand">Brand</span>
            <input value={brand} onChange={(event) => setBrand(event.target.value)} className="premium-input w-full rounded-xl px-4 py-3 outline-none" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand">Price</span>
            <input type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} className="premium-input w-full rounded-xl px-4 py-3 outline-none" required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand">Discount price</span>
            <input type="number" min="0" value={discountPrice} onChange={(event) => setDiscountPrice(event.target.value)} className="premium-input w-full rounded-xl px-4 py-3 outline-none" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand">Stock</span>
            <input type="number" min="0" value={stock} onChange={(event) => setStock(event.target.value)} className="premium-input w-full rounded-xl px-4 py-3 outline-none" required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand">Visibility</span>
            <select value={visibilityStatus} onChange={(event) => setVisibilityStatus(event.target.value as ProductInput["visibilityStatus"])} className="premium-input w-full rounded-xl px-4 py-3 outline-none">
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
              <option value="draft">Draft</option>
            </select>
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-brand">Summary</span>
          <input value={summary} onChange={(event) => setSummary(event.target.value)} className="premium-input w-full rounded-xl px-4 py-3 outline-none" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-brand">Description</span>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="premium-input min-h-32 w-full resize-none rounded-xl px-4 py-3 outline-none" required />
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-brand">Tags CSV</span>
            <textarea value={tags} onChange={(event) => setTags(event.target.value)} className="premium-input min-h-28 w-full resize-none rounded-xl px-4 py-3 outline-none" />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-brand">Features</span>
            <textarea value={features} onChange={(event) => setFeatures(event.target.value)} className="premium-input min-h-28 w-full resize-none rounded-xl px-4 py-3 outline-none" />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-brand">Materials</span>
            <textarea value={materials} onChange={(event) => setMaterials(event.target.value)} className="premium-input min-h-28 w-full resize-none rounded-xl px-4 py-3 outline-none" />
          </label>
        </div>
      </section>

      <aside className="space-y-5">
        <section className="premium-panel-strong rounded-[1.5rem] p-5">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-brand/40 bg-white/60 px-4 py-8 text-center text-brand">
            <Upload className="h-8 w-8" />
            <span className="mt-3 text-sm font-semibold">Upload product images</span>
            <span className="mt-1 text-xs text-steel">PNG, JPEG or WEBP. Multiple files supported.</span>
            <input type="file" multiple accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => void handleFiles(event.target.files).catch((uploadError) => setError(uploadError.message))} />
          </label>
          {previews.length > 0 ? (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {previews.map((src, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={`${src}-${index}`} src={assetUrl(src)} alt="" className="aspect-square rounded-xl border border-line bg-white object-cover" />
              ))}
            </div>
          ) : null}
        </section>

        <section className="premium-panel-strong space-y-4 rounded-[1.5rem] p-5">
          <label className="flex items-center justify-between gap-3 rounded-xl bg-white/60 px-4 py-3 text-sm font-semibold text-brand">
            Featured product
            <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} className="accent-brand" />
          </label>
          {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
          {status ? <p className="rounded-xl bg-white/70 px-4 py-3 text-sm text-brand">{status}</p> : null}
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white">
            <Save className="h-4 w-4" />
            Save Product
          </button>
        </section>
      </aside>
    </form>
  );
}
