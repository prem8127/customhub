"use client";

import { PointerEvent, useRef, useState } from "react";

import { CategoryCard, getCategoryCardTheme } from "@/components/CategoryCard";

type CategoriesMarqueeProps = {
  categories: Array<{
    label: string;
    description: string;
  }>;
};

export function CategoriesMarquee({ categories }: CategoriesMarqueeProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const [isDragging, setIsDragging] = useState(false);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    dragStateRef.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: viewport.scrollLeft
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;
    const dragState = dragStateRef.current;

    if (!viewport || !dragState.active) {
      return;
    }

    viewport.scrollLeft = dragState.scrollLeft - (event.clientX - dragState.startX);
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    dragStateRef.current.active = false;
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div className="category-marquee mt-14" data-dragging={isDragging ? "true" : undefined}>
      <div className="category-marquee__fade-left" aria-hidden="true" />
      <div className="category-marquee__fade-right" aria-hidden="true" />

      <div
        ref={viewportRef}
        className="category-marquee__viewport no-scrollbar"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerLeave={(event) => {
          if (dragStateRef.current.active) {
            handlePointerEnd(event);
          }
        }}
      >
        <div className="category-marquee__track">
          {[false, true].map((duplicate) => (
            <div
              key={duplicate ? "duplicate" : "primary"}
              className="category-marquee__segment"
              aria-hidden={duplicate}
            >
              {categories.map((category, index) => {
                const theme = getCategoryCardTheme(category.label);

                return (
                  <div key={`${duplicate ? "duplicate" : "primary"}-${category.label}`} className="w-[17.75rem] shrink-0">
                    <CategoryCard
                      title={category.label}
                      image={theme.image}
                      gradient={theme.gradient}
                      imageFrameClassName={theme.imageFrameClassName}
                      imageClassName={theme.imageClassName}
                      href={`/products?category=${encodeURIComponent(category.label)}`}
                      accent="#8f1d48"
                      showcase
                      priority={!duplicate && index < 4}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
