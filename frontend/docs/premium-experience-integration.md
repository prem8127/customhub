# Premium Experience Integration

All modules are isolated and opt-in. Nothing is auto-mounted into the existing app.

## Feature flags

Edit `frontend/lib/features.ts` to enable or disable each module globally.

## Hero replacement

Manual swap only:

```tsx
import { PremiumHeroSlider } from "@/components/premium";
import type { PremiumHeroSlide } from "@/lib/premium-types";

const slides: PremiumHeroSlide[] = [
  {
    id: "midnight-tee",
    title: "Products staged with launch-day polish.",
    subtitle: "Pass high-resolution product shots and CTA targets from your own catalog.",
    image: "/images/hero/midnight-tee-4k.jpg",
    alt: "Midnight Studio Tee hero image",
    cta: { label: "Shop now", href: "/product/midnight-studio-tee" }
  }
];

<PremiumHeroSlider slides={slides} />
```

To replace the current hero, manually swap the hero section inside `frontend/app/page.tsx`.

## Product page modules

### 360 viewer

```tsx
import { Product360Viewer } from "@/components/premium";

<Product360Viewer images={frames} />
```

Add it anywhere inside `frontend/app/product/[id]/page.tsx` or a nested client component. The module stays inert until you import it.

### 3D viewer

```tsx
import { Product3DViewer } from "@/components/3d";

<Product3DViewer modelUrl="/models/product.glb" />
```

Before using it:

1. Set `product3D: true` in `frontend/lib/features.ts`.
2. Provide a valid `.glb` asset under `public/` or another reachable URL.

### AI preview

```tsx
import { AIProductPreview } from "@/components/ai";

<AIProductPreview productImage="/images/products/case.png" category="mobile" />
```

The current implementation uses a mock canvas overlay generator. Later API integration can be injected with the `onGeneratePreview` prop.
