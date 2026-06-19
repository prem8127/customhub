"use client";

import dynamic from "next/dynamic";

import { FEATURES } from "@/lib/features";

type Product3DViewerProps = {
  modelUrl: string;
  className?: string;
  autoRotate?: boolean;
  backgroundColor?: string;
};

const Product3DCanvas = dynamic(
  () => import("./Product3DCanvas").then((module) => module.Product3DCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-soft">
        <div className="grid aspect-[4/3] place-items-center text-sm text-steel">Loading 3D viewer...</div>
      </div>
    )
  }
);

export function Product3DViewer(props: Product3DViewerProps) {
  if (!FEATURES.product3D) {
    return null;
  }

  return <Product3DCanvas {...props} />;
}
