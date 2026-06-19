import { PremiumHeroSlide, Product360Frame, PreviewCategory } from "@/lib/premium-types";

export const premiumHeroSlides: PremiumHeroSlide[] = [
  {
    id: "aurora-case-launch",
    eyebrow: "Premium mobile protection",
    title: "Aurora MagSafe Cover with a sharper retail finish.",
    subtitle:
      "High-resolution product imagery, cinematic transitions and a calmer premium presentation for your best-selling case line.",
    image: "/images/hero/aurora-case-hero.jpg",
    alt: "Aurora MagSafe cover hero image",
    cta: {
      label: "Shop Aurora",
      href: "/product/aurora-magsafe-case"
    },
    accent: "rgba(143, 29, 72, 0.34)"
  },
  {
    id: "smartphone-fit",
    eyebrow: "Device-fit design",
    title: "Show every curve, camera ring and edge treatment.",
    subtitle:
      "The premium slider now uses the root image assets moved into the proper public folders so they render cleanly in the storefront.",
    image: "/images/hero/smartphone-hero.jpg",
    alt: "Smartphone front-view mockup",
    cta: {
      label: "View Mobile Covers",
      href: "/products?category=Mobile%20covers"
    },
    accent: "rgba(143, 29, 72, 0.3)"
  },
  {
    id: "brand-drop",
    eyebrow: "CustomHub launch deck",
    title: "Brand-first visuals for custom drops and premium launches.",
    subtitle:
      "A third image from the repo root is staged as a supporting slide so the new hero rotates immediately with the assets you already had.",
    image: "/images/hero/customhub-square-hero.jpg",
    alt: "CustomHub launch artwork",
    cta: {
      label: "Browse Collection",
      href: "/products"
    },
    accent: "rgba(193, 79, 114, 0.26)"
  }
];

const product360FramesBySlug: Record<string, Product360Frame[]> = {
  "aurora-magsafe-case": [
    {
      src: "/images/360/aurora-magsafe/frame-01.jpg",
      alt: "Aurora MagSafe cover frame one"
    },
    {
      src: "/images/360/aurora-magsafe/frame-02.jpg",
      alt: "Aurora MagSafe cover frame two"
    },
    {
      src: "/images/360/aurora-magsafe/frame-03.jpg",
      alt: "Aurora MagSafe cover frame three"
    }
  ]
};

export function getProduct360Frames(slug: string) {
  return product360FramesBySlug[slug] ?? [];
}

export const aiPreviewAssetsBySlug: Record<
  string,
  {
    productImage: string;
    category: PreviewCategory;
  }
> = {
  "aurora-magsafe-case": {
    productImage: "/images/products/aurora-case.png",
    category: "mobile"
  }
};
