import Image from "next/image";
import Link from "next/link";
import { Bike, HardHat, Shirt, Smartphone, SmartphoneCharging, Sticker, Tags } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategoryCardTheme = {
  gradient: string;
  image: string;
  imageFrameClassName?: string;
  imageClassName?: string;
  icon: LucideIcon;
  showcaseImageClassName?: string;
};

export const categoryCardThemes: Record<Category, CategoryCardTheme> = {
  "T-shirts": {
    gradient: "from-[#fceef2] via-[#fff8fa] to-[#f6dce5]",
    image: "/category-images/t-shirt.png",
    imageFrameClassName: "right-[-30px] top-[55%]",
    imageClassName: "scale-[1.3] drop-shadow-[0_20px_30px_rgba(82,18,42,0.15)]",
    icon: Shirt,
    showcaseImageClassName: "!object-contain object-[50%_28%] scale-[0.95]"
  },
  Hoodies: {
    gradient: "from-[#f7e7ec] via-[#fff8fb] to-[#edd4de]",
    image: "/category-images/hoodie.png",
    imageFrameClassName: "right-[-30px] top-[55%]",
    imageClassName: "scale-[1.6] drop-shadow-[0_20px_30px_rgba(82,18,42,0.15)]",
    icon: Shirt,
    showcaseImageClassName: "object-[50%_18%] scale-[0.9]"
  },
  "Mobile covers": {
    gradient: "from-[#faecef] via-[#fff9fb] to-[#f3d8e0]",
    image: "/category-images/mobile-cover.png",
    icon: Smartphone,
    showcaseImageClassName: "!object-contain object-[50%_28%] scale-[0.92]"
  },
  "Bike accessories": {
    gradient: "from-[#faedf0] via-[#fff9fb] to-[#edd6de]",
    image: "/category-images/bike-accessories-v2.png",
    imageFrameClassName: "right-0 bottom-[-40px] top-auto translate-y-0",
    imageClassName: "scale-[2.08] drop-shadow-[0_20px_30px_rgba(82,18,42,0.15)]",
    icon: Bike,
    showcaseImageClassName: "object-[52%_25%] scale-[1.07]"
  },
  Stickers: {
    gradient: "from-[#f8e7ec] via-[#fff8fb] to-[#f1d3df]",
    image: "/category-images/stickers-v2.png",
    imageFrameClassName: "right-[-12px] top-[60%] -translate-y-1/2",
    imageClassName: "scale-[2.05] drop-shadow-[0_20px_30px_rgba(82,18,42,0.15)]",
    icon: Sticker,
    showcaseImageClassName: "object-[49%_20%] scale-[0.88]"
  },
  Keychains: {
    gradient: "from-[#f9dfe8] via-[#fff8fb] to-[#f3cad8]",
    image: "/category-images/keychains.png",
    imageClassName: "scale-[2.05] drop-shadow-[0_20px_30px_rgba(82,18,42,0.15)]",
    icon: Tags,
    showcaseImageClassName: "object-[50%_20%] scale-[1.01]"
  },
  "Chargers & safety accessories": {
    gradient: "from-[#f7e7ec] via-[#fff9fb] to-[#e8d0d9]",
    image: "/category-images/chargers-v2.png",
    imageClassName: "scale-[1.68] drop-shadow-[0_20px_30px_rgba(82,18,42,0.15)]",
    icon: SmartphoneCharging,
    showcaseImageClassName: "object-[50%_20%] scale-[0.96]"
  }
};

export function getCategoryCardTheme(category: Category | string) {
  return categoryCardThemes[category as Category] ?? categoryCardThemes["T-shirts"];
}

const categoryDisplayTitles: Partial<Record<Category, string>> = {
  "Mobile covers": "Mobile Covers"
};

function getCategoryDisplayTitle(category: string) {
  return categoryDisplayTitles[category as Category] ?? category;
}

type CategoryCardProps = {
  title: string;
  description?: string;
  image: string;
  gradient: string;
  imageFrameClassName?: string;
  imageClassName?: string;
  href: string;
  accent: string;
  eyebrow?: string;
  ctaLabel?: string;
  metaLabel?: string;
  compact?: boolean;
  showcase?: boolean;
  priority?: boolean;
};

export function CategoryCard({
  title,
  description,
  image,
  gradient,
  imageFrameClassName,
  imageClassName,
  href,
  accent,
  eyebrow,
  ctaLabel = "Explore",
  metaLabel = "Ready now",
  compact = false,
  showcase = false,
  priority = false
}: CategoryCardProps) {
  const theme = getCategoryCardTheme(title);
  const Icon = theme.icon ?? HardHat;
  const displayTitle = getCategoryDisplayTitle(title);

  if (showcase) {
    return (
      <Link
        href={href}
        className="group relative block h-[20rem] overflow-hidden rounded-[24px] bg-[#f7dce4] shadow-[0_18px_42px_rgba(82,18,42,0.16)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_28px_68px_rgba(82,18,42,0.2)] sm:h-[23rem] lg:h-[25.25rem]"
      >
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1280px) 285px, (min-width: 1024px) 24vw, (min-width: 640px) 45vw, 90vw"
          priority={priority}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]",
            theme.showcaseImageClassName
          )}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#fff4f6]/30 via-[#b50a4c]/20 to-[#a00042] opacity-95"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-[#a00042] via-[#a00042]/92 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-7">
          <span className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-[#aa0648]/95 text-white shadow-[0_14px_32px_rgba(82,18,42,0.22)] ring-1 ring-white/15">
            <Icon className="h-8 w-8" strokeWidth={1.85} />
          </span>
          <h2 className="max-w-[12rem] text-[2rem] font-extrabold leading-[1.08] tracking-normal text-white sm:text-[2.25rem]">
            {displayTitle}
          </h2>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex aspect-square min-h-0 flex-col justify-between overflow-hidden rounded-[24px] border border-white/75 bg-gradient-to-br p-6 shadow-[0_20px_55px_rgba(82,18,42,0.08)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_28px_75px_rgba(82,18,42,0.14)] sm:p-8",
        gradient
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[24px] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.86),transparent_56%)]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/60" />

      <div className={cn("relative z-10 pr-4", compact ? "max-w-[80%]" : "max-w-[65%]") }>
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: accent }}>
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={cn(
            compact ? "text-2xl font-semibold tracking-tight text-brand leading-tight" : "text-3xl font-semibold tracking-tight text-ink",
            eyebrow ? "mt-5" : ""
          )}
        >
          {title}
        </h2>
        {!compact && description ? <p className="mt-4 text-sm leading-7 text-steel">{description}</p> : null}
      </div>

      {!compact ? (
        <div className="relative z-10 mt-10 flex max-w-[65%] items-center justify-between gap-4 pr-4">
          <span className="inline-flex rounded-full border border-white/80 bg-white/90 px-4 py-2 text-sm font-medium text-ink shadow-[0_10px_25px_rgba(82,18,42,0.08)] backdrop-blur">
            {ctaLabel}
          </span>
          <span className="text-xs uppercase tracking-[0.28em] text-steel transition duration-300 group-hover:text-ink">
            {metaLabel}
          </span>
        </div>
      ) : null}

      <div
        className={cn(
          "pointer-events-none absolute right-[-12px] top-1/2 z-[1] h-[140px] w-[140px] -translate-y-1/2",
          imageFrameClassName
        )}
      >
        <Image
          src={image}
          alt=""
          width={140}
          height={140}
          aria-hidden="true"
          sizes="140px"
          priority={priority}
          style={{ width: "auto", height: "auto" }}
          className={cn(
            "h-auto w-full object-contain rotate-[-8deg] drop-shadow-[0_10px_20px_rgba(82,18,42,0.15)] transition-transform duration-300 ease-out",
            imageClassName
          )}
        />
      </div>
    </Link>
  );
}
