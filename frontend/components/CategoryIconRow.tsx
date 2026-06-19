"use client";

import { type ComponentType } from "react";
import { BatteryCharging, Bike, Key, Shirt, Smartphone, Sticker } from "lucide-react";

import { Category, categories } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategoryIconRowProps = {
  selectedCategory: Category | "All";
  onSelectCategory: (category: Category | "All") => void;
};

const categoryIcons: Record<Category, ComponentType<{ className?: string }>> = {
  "T-shirts": Shirt,
  // lucide-react does not export a Hoodie icon in this version.
  Hoodies: Shirt,
  "Mobile covers": Smartphone,
  "Bike accessories": Bike,
  Stickers: Sticker,
  Keychains: Key,
  "Chargers & safety accessories": BatteryCharging
};

export function CategoryIconRow({
  selectedCategory,
  onSelectCategory
}: CategoryIconRowProps) {
  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
      {categories.map((category) => {
        const Icon = categoryIcons[category];
        const isActive = selectedCategory === category;

        return (
          <button
            key={category}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelectCategory(isActive ? "All" : category)}
            className={cn(
              "group flex min-w-[7.5rem] flex-col items-center gap-3 rounded-[1.5rem] px-3 py-4 text-center transition",
              isActive ? "bg-white/90 shadow-card" : "hover:bg-white/70"
            )}
          >
            <span
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white/80 transition",
                isActive ? "text-ink" : "text-steel group-hover:text-ink"
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span
              className={cn(
                "text-xs font-medium leading-5",
                isActive ? "text-ink" : "text-steel"
              )}
            >
              {category}
            </span>
          </button>
        );
      })}
    </div>
  );
}
