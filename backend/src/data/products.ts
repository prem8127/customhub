export const categories = [
  "T-shirts",
  "Hoodies",
  "Mobile covers",
  "Bike accessories",
  "Stickers",
  "Keychains",
  "Chargers & safety accessories"
] as const;

export type SeedProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  popularity: number;
  rating: number;
  badge: string;
  summary: string;
  description: string;
  turnaround: string;
  features: string[];
  materials: string[];
  accent: string;
  surface: string;
  customizable: boolean;
  thumbnail?: string | null;
  art: {
    base: string;
    glow: string;
    detail: string;
  };
};

const baseProducts: SeedProduct[] = [
  {
    id: "tee-midnight-studio",
    slug: "midnight-studio-tee",
    name: "Midnight Studio Tee",
    category: "T-shirts",
    price: 1299,
    originalPrice: 1599,
    popularity: 98,
    rating: 4.9,
    badge: "Best Seller",
    summary: "Premium heavyweight cotton tee tuned for brand drops and creator merch.",
    description:
      "A clean oversized silhouette with a dense weave that holds prints, embroidery and custom artwork with a polished retail finish.",
    turnaround: "Ships in 4-6 days",
    features: ["240 GSM cotton", "Soft brushed interior", "Pre-shrunk finish"],
    materials: ["100% combed cotton", "Water-based print support", "Bio-washed"],
    accent: "#0F5BFF",
    surface: "from-slate-900 via-slate-700 to-slate-500",
    customizable: true,
    art: {
      base: "#d9e8ff",
      glow: "rgba(15, 91, 255, 0.35)",
      detail: "#0f1729"
    }
  },
  {
    id: "hoodie-arctic-signal",
    slug: "arctic-signal-hoodie",
    name: "Arctic Signal Hoodie",
    category: "Hoodies",
    price: 2499,
    originalPrice: 2899,
    popularity: 94,
    rating: 4.8,
    badge: "New",
    summary: "Structured fleece hoodie with a sharp premium drape and studio-ready print zone.",
    description:
      "Built for high-end merchandising with double-lined panels, elevated ribbing and a deep matte tone that makes custom graphics feel cinematic.",
    turnaround: "Ships in 5-7 days",
    features: ["420 GSM fleece", "Double-lined hood", "Metallic cord tips"],
    materials: ["Cotton-rich fleece", "Rib-knit cuffs", "Fade-resistant dye"],
    accent: "#56A8FF",
    surface: "from-slate-950 via-slate-800 to-slate-600",
    customizable: true,
    art: {
      base: "#d9eefb",
      glow: "rgba(86, 168, 255, 0.34)",
      detail: "#dbeafe"
    }
  },
  {
    id: "case-aurora-magsafe",
    slug: "aurora-magsafe-case",
    name: "Aurora MagSafe Cover",
    category: "Mobile covers",
    price: 999,
    popularity: 96,
    rating: 4.9,
    badge: "Editor Pick",
    summary: "Impact-ready phone cover with crystal edges and precision-fit camera ring.",
    description:
      "Designed for clean artwork placement with a glassy backplate, raised lip protection and MagSafe alignment for premium everyday carry.",
    turnaround: "Ships in 3-5 days",
    features: ["MagSafe compatible", "10 ft drop guard", "Gloss and matte finish"],
    materials: ["TPU bumper", "Polycarbonate shell", "Anti-yellow coating"],
    accent: "#21A67A",
    surface: "from-emerald-900 via-teal-700 to-cyan-500",
    customizable: true,
    art: {
      base: "#d7fff0",
      glow: "rgba(33, 166, 122, 0.34)",
      detail: "#022c22"
    }
  },
  {
    id: "bike-carbon-grip",
    slug: "carbon-grip-wrap",
    name: "Carbon Grip Wrap Kit",
    category: "Bike accessories",
    price: 1899,
    popularity: 86,
    rating: 4.7,
    badge: "Performance",
    summary: "Minimal bar wrap and tank detail kit for riders who want custom identity without clutter.",
    description:
      "Textured wrap and reflective detail pieces engineered for daily riding, weekend builds and premium garage gifting.",
    turnaround: "Ships in 6-8 days",
    features: ["Waterproof adhesive", "Reflective trim", "Heat-resistant finish"],
    materials: ["Carbon weave vinyl", "Micro-textured grip layer", "UV seal"],
    accent: "#5A6378",
    surface: "from-slate-800 via-stone-600 to-zinc-400",
    customizable: true,
    art: {
      base: "#eef2ff",
      glow: "rgba(90, 99, 120, 0.28)",
      detail: "#1f2937"
    }
  },
  {
    id: "sticker-luxe-pack",
    slug: "luxe-sticker-pack",
    name: "Luxe Sticker Pack",
    category: "Stickers",
    price: 499,
    popularity: 91,
    rating: 4.8,
    badge: "Studio Pack",
    summary: "Contour-cut stickers with dense color reproduction and premium laminate.",
    description:
      "A multi-piece sheet system for logos, mascots and creator iconography with excellent edge finishing and outdoor durability.",
    turnaround: "Ships in 2-4 days",
    features: ["Contour cut", "Gloss or matte", "Outdoor safe"],
    materials: ["Vinyl film", "Scratch-proof laminate", "Bubble-free adhesive"],
    accent: "#FFB11A",
    surface: "from-amber-300 via-orange-200 to-yellow-100",
    customizable: true,
    art: {
      base: "#fff2d2",
      glow: "rgba(255, 177, 26, 0.36)",
      detail: "#7c2d12"
    }
  },
  {
    id: "keychain-lucid-tag",
    slug: "lucid-tag-keychain",
    name: "Lucid Tag Keychain",
    category: "Keychains",
    price: 699,
    popularity: 84,
    rating: 4.6,
    badge: "Gift Ready",
    summary: "Acrylic and alloy keychain with edge polish suited for logos and initials.",
    description:
      "Designed to feel more like a premium collectible than a giveaway, with smooth bevels and a sturdy metal loop.",
    turnaround: "Ships in 3-5 days",
    features: ["Edge polished", "Full-color print", "Split ring included"],
    materials: ["Clear acrylic", "Brushed alloy", "Scratch-resistant coat"],
    accent: "#FC6D53",
    surface: "from-rose-200 via-orange-200 to-red-100",
    customizable: true,
    art: {
      base: "#ffe2da",
      glow: "rgba(252, 109, 83, 0.3)",
      detail: "#7f1d1d"
    }
  },
  {
    id: "charger-safe-drive",
    slug: "safe-drive-fast-charger",
    name: "SafeDrive Fast Charger",
    category: "Chargers & safety accessories",
    price: 2199,
    popularity: 88,
    rating: 4.7,
    badge: "Premium",
    summary: "Vehicle-ready charger bundle with reflective safety insert and cable wrap.",
    description:
      "An elevated travel kit combining a fast charger, braided cable and compact reflective safety accessory for night rides and road trips.",
    turnaround: "Ships in 4-6 days",
    features: ["PD fast charge", "Braided cable", "Reflective safety tab"],
    materials: ["Aluminum shell", "Kevlar-braided cable", "ABS safety housing"],
    accent: "#0E7490",
    surface: "from-cyan-800 via-sky-700 to-slate-500",
    customizable: false,
    art: {
      base: "#d9f5ff",
      glow: "rgba(14, 116, 144, 0.32)",
      detail: "#083344"
    }
  },
  {
    id: "tee-ivory-mark",
    slug: "ivory-mark-tee",
    name: "Ivory Mark Tee",
    category: "T-shirts",
    price: 1199,
    popularity: 82,
    rating: 4.6,
    badge: "Minimal",
    summary: "A soft neutral tee with clean proportions for understated personal branding.",
    description:
      "Made for subtle monograms, minimal marks and tonal artwork with a retail-quality finish and versatile everyday comfort.",
    turnaround: "Ships in 4-6 days",
    features: ["220 GSM cotton", "Relaxed fit", "Ultra-soft wash"],
    materials: ["Combed cotton", "Low-shrink construction", "Smooth knit"],
    accent: "#A16207",
    surface: "from-stone-200 via-zinc-100 to-white",
    customizable: true,
    art: {
      base: "#fff9db",
      glow: "rgba(161, 98, 7, 0.22)",
      detail: "#44403c"
    }
  }
];

const targetCount = 10;
const variantLabels = ["Nova", "Core", "Pro", "Edge", "Prime", "Luxe", "Studio", "Plus", "Ultra"];

// Original placeholder illustrations (not real product photos) shown until
// real photos are uploaded per-product via the admin panel.
const categoryPlaceholders: Record<string, string> = {
  "T-shirts": "/category-images/t-shirt.png",
  Hoodies: "/category-images/hoodie.png",
  "Mobile covers": "/category-images/mobile-cover.png",
  "Bike accessories": "/category-images/bike-accessories-v2.png",
  Stickers: "/category-images/stickers-v2.png",
  Keychains: "/category-images/keychains.png",
  "Chargers & safety accessories": "/category-images/chargers-v2.png"
};

function clampRating(value: number) {
  return Math.max(4.2, Math.min(5, Number(value.toFixed(1))));
}

export function buildSeedProducts() {
  const byCategory = new Map<string, SeedProduct[]>();
  categories.forEach((category) => byCategory.set(category, []));
  baseProducts.forEach((product) => byCategory.get(product.category)?.push(product));

  const expanded: SeedProduct[] = [];

  categories.forEach((category) => {
    const seeds = byCategory.get(category) ?? [];
    const categoryProducts = [...seeds];
    let variantIndex = 1;

    while (categoryProducts.length < targetCount) {
      const template = seeds[(variantIndex - 1) % seeds.length];
      const label = variantLabels[(variantIndex - 1) % variantLabels.length];
      const priceShift = ((variantIndex % 5) - 2) * 80;
      const price = Math.max(399, template.price + priceShift);
      const nextProduct: SeedProduct = {
        ...template,
        id: `${template.id}-v${variantIndex}`,
        slug: `${template.slug}-${label.toLowerCase()}`,
        name: `${template.name} ${label}`,
        price,
        popularity: Math.max(70, template.popularity - (variantIndex % 6)),
        rating: clampRating(template.rating - (variantIndex % 4) * 0.1),
        badge: label,
        summary: `${template.summary} ${label} edition for premium custom drops.`
      };

      if (template.originalPrice !== undefined && template.originalPrice !== null) {
        nextProduct.originalPrice = Math.max(price + 150, template.originalPrice + priceShift);
      }

      categoryProducts.push(nextProduct);
      variantIndex += 1;
    }

    expanded.push(...categoryProducts.slice(0, targetCount));
  });

  return expanded.map((product) => ({
    ...product,
    thumbnail: product.thumbnail ?? categoryPlaceholders[product.category] ?? null
  }));
}