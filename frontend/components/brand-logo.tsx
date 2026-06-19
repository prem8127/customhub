import Image from "next/image";
import Link from "next/link";

import customHubLogo from "@/Categories images/CustomHublogo.png";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  iconWrapClassName?: string;
  imageClassName?: string;
  textClassName?: string;
  priority?: boolean;
  showBadge24?: boolean;
};

export function BrandLogo({
  className,
  iconWrapClassName,
  imageClassName,
  textClassName,
  priority = false,
  showBadge24 = false
}: BrandLogoProps) {
  return (
    <Link
      href="/"
      data-skip-route-loader="true"
      className={cn("inline-flex items-center gap-3 text-ink transition hover:opacity-95", className)}
    >
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-white/95 shadow-[0_14px_28px_rgba(82,18,42,0.1)]",
          iconWrapClassName
        )}
      >
        <Image
          src={customHubLogo}
          alt="CustomHub logo"
          priority={priority}
          className={cn("w-[2.875rem] h-[2.875rem] md:w-[3.4375rem] md:h-[3.4375rem] object-contain", imageClassName)}
        />
      </span>
      <span className={cn("relative inline-flex text-xl font-semibold tracking-tight text-ink", textClassName)}>
        <span>CustomHub</span>
        {showBadge24 ? (
          <span className="absolute -right-4 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[0.6rem] font-semibold leading-none text-white shadow-sm">
            24
          </span>
        ) : null}
      </span>
    </Link>
  );
}
