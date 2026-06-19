"use client";

import Link from "next/link";
import { Grid2x2, Home, ShoppingBag, Truck, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

import { useCart } from "@/components/cart-provider";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Products", icon: Grid2x2 },
  { href: "/orders", label: "Orders", icon: Truck },
  { href: "/cart", label: "Cart", icon: ShoppingBag },
  { href: "/account", label: "Account", icon: UserRound }
];

export function MobileNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <nav className="fixed inset-x-4 bottom-4 z-40 rounded-[1.35rem] border border-white/80 bg-[rgba(255,249,250,0.94)] px-2 py-2 shadow-[0_20px_56px_rgba(82,18,42,0.14)] backdrop-blur-2xl lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition",
                active ? "bg-white text-brand shadow-[0_8px_22px_rgba(82,18,42,0.08)]" : "text-steel"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {item.href === "/cart" && itemCount > 0 ? (
                <span className="absolute right-2 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] text-white shadow-sm">
                  {itemCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
