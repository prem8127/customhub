import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search, Settings, ShoppingBag } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { CategoriesMarquee } from "@/components/categories-marquee";
import { getCategoryCardTheme } from "@/components/CategoryCard";
import { assetUrl, fetchCategories, fetchProducts } from "@/lib/api";

function price(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export default async function HomePage() {
  // fetchProducts and fetchCategories already have try/catch in api.ts and return
  // empty arrays if the backend is offline — so this page always renders.
  const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()]);
  const heroProducts = products.slice(0, 4);
  const marqueeCategories = categories.map((category) => ({
    label: category.name,
    description: category.description ?? "Custom-ready products with polished print and finish options."
  }));

  return (
    <div className="pb-28 lg:pb-10">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 pb-40">
        <div className="relative min-h-[540px] overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_72%_30%,rgba(231,15,102,0.78),transparent_34%),linear-gradient(135deg,#650028_0%,#9b003f_48%,#d4075b_100%)] p-6 text-white shadow-[0_34px_95px_rgba(82,18,42,0.28)] sm:p-10 lg:min-h-[650px]">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_92%_16%,rgba(255,255,255,0.18)_1px,transparent_1.5px)] bg-[length:18px_18px] opacity-30" />
          <div aria-hidden="true" className="absolute -bottom-20 left-[-6%] h-64 w-[78%] rounded-[50%] border-t-2 border-[#ff3d93]/55" />
          <div aria-hidden="true" className="absolute -bottom-28 left-[8%] h-72 w-[80%] rounded-[50%] border-t border-[#ff78b4]/35" />
          <div aria-hidden="true" className="absolute bottom-8 left-8 grid grid-cols-8 gap-3 opacity-25">
            {Array.from({ length: 48 }).map((_, index) => (
              <span key={index} className="h-1 w-1 rounded-full bg-[#ff70aa]" />
            ))}
          </div>
          <span aria-hidden="true" className="absolute left-[52%] top-[42%] text-5xl font-thin text-[#ff5aa0]/80">✦</span>
          <span aria-hidden="true" className="absolute right-[26%] top-[12%] text-5xl font-thin text-[#ff78b4]/75">✦</span>
          <span aria-hidden="true" className="absolute right-[15%] top-[22%] text-3xl font-thin text-[#ff70aa]/55">✦</span>

          <div className="relative z-10 hidden items-start justify-between gap-4 lg:flex">
            <BrandLogo
              showBadge24
              className="text-white"
              iconWrapClassName="h-14 w-14"
              imageClassName="h-14 w-14"
              textClassName="text-3xl font-bold text-white"
            />
            <div className="flex gap-3">
              {[Search, Settings, ShoppingBag].map((Icon, index) => (
                <span key={index} className="grid h-16 w-16 place-items-center rounded-full border border-white/15 bg-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_16px_35px_rgba(82,18,42,0.2)] backdrop-blur">
                  <Icon className="h-7 w-7" />
                </span>
              ))}
            </div>
          </div>

          <div className="relative z-10 grid min-h-[460px] items-center gap-8 pt-8 lg:min-h-[540px] lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] lg:pt-6">
            <div className="max-w-3xl">
              <p className="text-xl font-medium text-white/82">CustomHub studio commerce</p>
              <div className="mt-5 h-0.5 w-12 bg-[#ff2f8a]" />
              <h2 className="mt-9 text-5xl font-extrabold leading-[1.1] tracking-normal text-[#fff7ed] sm:text-6xl lg:text-7xl">
              Discover premium custom products
              </h2>
              <p className="mt-8 max-w-2xl text-xl leading-9 text-white/86">
                Browse curated collections, customize quickly and checkout with saved profiles on the dedicated login page.
              </p>
              <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                <Link href="/products" className="inline-flex items-center justify-center gap-4 rounded-full bg-[#fff8f2] px-9 py-5 text-base font-bold text-brand shadow-[0_18px_42px_rgba(52,0,25,0.22)]">
                  Browse products
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/categories" className="inline-flex items-center justify-center gap-4 rounded-full border-2 border-[#ff2f8a]/85 bg-[#6d002d]/20 px-9 py-5 text-base font-bold text-white shadow-[0_18px_42px_rgba(52,0,25,0.14)] backdrop-blur">
                  Categories
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="relative min-h-[280px] lg:min-h-[500px]">
              <Image
                src="/images/hero/products_all.png"
                alt="CustomHub custom products"
                fill
                sizes="(min-width: 1024px) 52vw, 92vw"
                className="object-contain object-bottom drop-shadow-[0_38px_55px_rgba(42,0,20,0.38)]"
                priority
              />
            </div>
          </div>
        </div>

        {/* Stacked panels below hero */}
        <div className="mt-6 grid gap-5">
          <div className="premium-panel-strong overflow-hidden rounded-[2rem] p-7 sm:p-10 lg:p-12">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-extrabold tracking-normal text-brand sm:text-5xl">
                  Find your canvas
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-brand/85 sm:text-lg">
                  Dense blanks, polished accessories and fast customization built for retail-grade drops.
                </p>
              </div>
              <Link href="/categories" className="hidden rounded-full bg-brand px-7 py-4 text-sm font-bold text-white shadow-[0_14px_30px_rgba(143,29,72,0.22)] sm:inline-flex">
                Browse all
              </Link>
            </div>

            <CategoriesMarquee categories={marqueeCategories} />
          </div>

          <div className="premium-panel-strong rounded-[2rem] p-6 sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-steel">Products</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Popular now</h2>
              </div>
              <Link href="/products" className="text-sm font-semibold text-brand">Browse all</Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {heroProducts.map((product, index) => {
                const theme = getCategoryCardTheme(product.category);
                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="relative overflow-hidden rounded-[1.25rem] border border-white/80 bg-white/70 p-4 flex items-center gap-4"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0">
                      {product.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={assetUrl(product.thumbnail)}
                          alt=""
                          className="h-full w-full object-contain drop-shadow-[0_18px_30px_rgba(82,18,42,0.15)]"
                        />
                      ) : (
                        <Image
                          src={theme.image}
                          alt=""
                          fill
                          sizes="160px"
                          className="object-contain drop-shadow-[0_18px_30px_rgba(82,18,42,0.15)]"
                          priority={index < 2}
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand">{product.name}</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-steel">{product.summary}</p>
                      <p className="mt-2 text-sm font-bold text-ink">{price(product.price)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
