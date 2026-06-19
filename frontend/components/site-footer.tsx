import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";

const footerGroups = [
  {
    title: "Shop",
    links: ["T-shirts", "Hoodies", "Mobile covers", "Gift sets"]
  },
  {
    title: "Support",
    links: ["Shipping", "Returns", "Customization guide", "Track order"]
  },
  {
    title: "Company",
    links: ["About CustomHub", "Studios", "Careers", "Contact"]
  }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/70 bg-[rgba(255,248,250,0.78)]">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <BrandLogo textClassName="text-2xl" />
            <p className="max-w-md text-sm leading-7 text-steel">
              Premium custom commerce for creators, teams and brands. Built around elevated product
              quality, refined design and a fast personalization flow.
            </p>
          </div>
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-ink/70">
                {group.title}
              </h3>
              <ul className="mt-5 space-y-3 text-sm text-steel">
                {group.links.map((link) => (
                  <li key={link}>
                    <Link href={link === "Track order" ? "/orders" : "/products"}>{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-white/70 pt-6 text-sm text-steel">
          Copyright © 2026 CustomHub. Designed for premium custom commerce.
        </div>
      </div>
    </footer>
  );
}
