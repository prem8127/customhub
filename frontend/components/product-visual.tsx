import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { assetUrl } from "@/lib/api";

type ProductVisualProps = {
  product: Product;
  variant?: "hero" | "card" | "detail" | "cart" | "compact";
  showOverlayText?: boolean;
};

export function ProductVisual({
  product,
  variant = "card",
  showOverlayText = true
}: ProductVisualProps) {
  const art = {
    base: product.art?.base ?? "#fff2f5",
    glow: product.art?.glow ?? "rgba(143, 29, 72, 0.24)",
    detail: product.art?.detail ?? "#8f1d48"
  };
  const heights = {
    hero: "h-[360px] sm:h-[460px]",
    detail: "h-[380px] sm:h-[460px]",
    card: "h-64",
    cart: "h-44 sm:h-40",
    compact: "h-[7.25rem] sm:h-[7.75rem]"
  };

  const hasImage = Boolean(product.thumbnail);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2.15rem] border border-white/70 bg-gradient-to-br shadow-[0_24px_72px_rgba(82,18,42,0.14)]",
        variant === "compact" ? "p-4 sm:p-5" : "p-6",
        product.surface ?? "from-[#fceef2] via-[#fff8fa] to-[#f6dce5]",
        heights[variant]
      )}
    >
      {/* Decorative glow — only when no real image */}
      {!hasImage && (
        <div
          className={cn(
            "absolute inset-x-[12%] rounded-full blur-3xl",
            variant === "compact" ? "top-7 h-24" : "top-10 h-40"
          )}
          style={{ background: art.glow }}
        />
      )}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),transparent_38%)]" />

      <div className="relative flex h-full items-center justify-center">
        <div className="relative flex items-center justify-center">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={assetUrl(product.thumbnail)}
              alt={product.name}
              className="animate-drift object-contain drop-shadow-[0_22px_32px_rgba(82,18,42,0.16)]"
              style={{
                maxHeight:
                  variant === "compact" ? "90%" :
                  variant === "cart" ? "88%" : "82%",
                maxWidth:
                  variant === "compact" ? "90%" :
                  variant === "cart" ? "88%" : "82%",
              }}
            />
          ) : (
            <>
              <div
                className="animate-drift rounded-[2rem] border border-white/70 shadow-[0_16px_32px_rgba(82,18,42,0.14)]"
                style={{
                  width:
                    variant === "hero"
                      ? 300
                      : variant === "detail"
                        ? 280
                        : variant === "cart"
                          ? 128
                          : variant === "compact"
                            ? 108
                            : 210,
                  height:
                    variant === "hero"
                      ? 340
                      : variant === "detail"
                        ? 320
                        : variant === "cart"
                          ? 152
                          : variant === "compact"
                            ? 126
                            : 250,
                  background: `linear-gradient(180deg, ${art.base}, #fff9fb 72%)`
                }}
              />
              <div
                className="absolute inset-[16%] rounded-[1.5rem] border border-white/70"
                style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
              />
              <div
                className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ backgroundColor: art.detail, boxShadow: `0 0 60px ${art.glow}` }}
              />
              {showOverlayText ? (
                <div className="absolute left-1/2 top-[58%] -translate-x-1/2 text-center">
                  <p
                    className={cn(
                      "uppercase tracking-[0.35em] text-ink/80",
                      variant === "compact" ? "text-[10px]" : "text-xs"
                    )}
                  >
                    {product.category}
                  </p>
                  <p
                    className={cn(
                      "mt-2 font-semibold text-ink",
                      variant === "cart" || variant === "compact" ? "text-sm" : "text-lg"
                    )}
                  >
                    {product.name}
                  </p>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* Badge pill */}
      <div
        className={cn(
          "absolute left-5 top-5 rounded-full border border-white/70 bg-white/80 font-semibold uppercase tracking-[0.24em] text-brand backdrop-blur",
          variant === "compact" ? "left-4 top-4 px-2.5 py-1 text-[9px]" : "px-4 py-2 text-xs"
        )}
      >
        {product.badge}
      </div>
    </div>
  );
}