"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { FEATURES } from "@/lib/features";
import { PremiumHeroSlide } from "@/lib/premium-types";
import { cn } from "@/lib/utils";

type PremiumHeroSliderProps = {
  slides: PremiumHeroSlide[];
  autoPlayMs?: number;
  className?: string;
};

export function PremiumHeroSlider({
  slides,
  autoPlayMs = 4000,
  className
}: PremiumHeroSliderProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragging, setDragging] = useState(false);

  const slideCount = slides.length;

  const showNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    if (!FEATURES.premiumHero || slideCount < 2 || dragging) {
      return;
    }

    const timerId = window.setInterval(() => {
      showNext();
    }, autoPlayMs);

    return () => window.clearInterval(timerId);
  }, [autoPlayMs, dragging, showNext, slideCount]);

  if (!FEATURES.premiumHero || slideCount === 0) {
    return null;
  }

  const slide = slides[activeIndex];
  const nextIndex = activeIndex === slideCount - 1 ? 0 : activeIndex + 1;

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-[2.75rem] border border-white/70 bg-[linear-gradient(180deg,#fff8fa_0%,#f5e7eb_100%)] text-ink shadow-soft",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(143,29,72,0.14),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.68),transparent_18%)]" />
      <AnimatePresence initial={false} mode="wait">
        <motion.article
          key={slide.id}
          className="relative"
          drag={slideCount > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.08}
          onDragStart={() => setDragging(true)}
          onDragEnd={(_, info) => {
            setDragging(false);

            if (Math.abs(info.offset.x) < 90 && Math.abs(info.velocity.x) < 550) {
              return;
            }

            if (info.offset.x < 0 || info.velocity.x < -550) {
              setActiveIndex((current) => (current + 1) % slideCount);
              return;
            }

            setActiveIndex((current) => (current - 1 + slideCount) % slideCount);
          }}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: shouldReduceMotion ? 0.25 : 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative grid items-center gap-10 px-6 py-8 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-14 xl:px-20">
            <div className="max-w-2xl">
              <motion.p
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="text-xs uppercase tracking-[0.38em] text-steel"
              >
                {slide.eyebrow ?? "Premium product launch"}
              </motion.p>
              <motion.h1
                initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.12 }}
                className="mt-6 max-w-xl text-balance text-5xl font-semibold tracking-[-0.05em] text-ink sm:text-6xl lg:text-7xl"
              >
                {slide.title}
              </motion.h1>
              <motion.p
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.72, delay: 0.18 }}
                className="mt-6 max-w-xl text-lg leading-8 text-steel sm:text-xl"
              >
                {slide.subtitle}
              </motion.p>
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.24 }}
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                <Link
                  href={slide.cta.href}
                  className="inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5"
                >
                  {slide.cta.label}
                </Link>
                <span className="rounded-full border border-white/80 bg-white/82 px-4 py-2 text-xs uppercase tracking-[0.26em] text-steel backdrop-blur">
                  Swipe to explore
                </span>
              </motion.div>
            </div>

            <div className="relative hidden min-h-[36rem] items-center justify-end lg:flex">
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92, y: 18 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.82, delay: 0.12 }}
                className="relative h-[34rem] w-full max-w-[58rem]"
              >
                <div className="absolute inset-x-10 top-8 h-16 rounded-full bg-[rgba(143,29,72,0.14)] blur-3xl" />
                <div className="absolute left-6 top-6 rounded-full border border-white/75 bg-white/88 px-4 py-2 text-xs uppercase tracking-[0.3em] text-steel shadow-sm">
                  {String(activeIndex + 1).padStart(2, "0")} / {String(slideCount).padStart(2, "0")}
                </div>
                <div className="absolute left-0 top-12 h-[20.5rem] w-[62%] overflow-hidden rounded-[2.4rem] border border-white/85 bg-white/82 p-4 shadow-[0_24px_60px_rgba(82,18,42,0.12)] backdrop-blur-xl">
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    className="h-full w-full rounded-[1.8rem] object-cover object-center"
                    loading={activeIndex === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </div>
                <div className="absolute right-[15%] top-0 h-[30rem] w-[26%] overflow-hidden rounded-[2.1rem] border border-white/85 bg-white/90 p-3 shadow-[0_20px_48px_rgba(82,18,42,0.12)] backdrop-blur-xl">
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    className="h-full w-full rounded-[1.55rem] object-cover object-center"
                    loading={activeIndex === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </div>
                <div className="absolute right-0 bottom-0 h-[25.5rem] w-[22%] overflow-hidden rounded-[2.1rem] border border-white/85 bg-white/90 p-3 shadow-[0_20px_48px_rgba(82,18,42,0.12)] backdrop-blur-xl">
                  <div className="flex h-full flex-col rounded-[1.55rem] bg-[linear-gradient(180deg,#fff8fa_0%,#f6ebee_100%)] p-4">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-steel">
                      <span>Settings</span>
                      <span className="h-2 w-2 rounded-full bg-brand" />
                    </div>
                    <div className="mt-4 rounded-[1.35rem] bg-white px-4 py-4 shadow-sm">
                      <p className="text-sm font-semibold text-ink">CustomHub</p>
                      <p className="mt-1 text-xs leading-5 text-steel">Premium storefront, live customization and secure checkout.</p>
                    </div>
                    <div className="mt-auto rounded-[1.35rem] bg-brand px-4 py-4 text-white shadow-card">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/75">Action</p>
                      <p className="mt-2 text-sm font-semibold">View storefront</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.article>
      </AnimatePresence>

      <div className="absolute bottom-6 left-6 right-6 z-10 flex items-center justify-between gap-4 sm:bottom-8 sm:left-10 sm:right-10">
        <div className="flex flex-1 gap-2">
          {slides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group flex-1"
              aria-label={`Go to slide ${index + 1}`}
            >
              <span className="block h-[3px] overflow-hidden rounded-full bg-white/18">
                <motion.span
                  className="block h-full rounded-full bg-white"
                  animate={{ width: index === activeIndex ? "100%" : index < activeIndex ? "100%" : "0%" }}
                  transition={{ duration: index === activeIndex ? autoPlayMs / 1000 : 0.28, ease: "linear" }}
                />
              </span>
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => setActiveIndex((current) => (current - 1 + slideCount) % slideCount)}
            className="rounded-full border border-white/16 bg-white/8 px-4 py-2 text-sm text-white/80 backdrop-blur"
            aria-label="Previous slide"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex(nextIndex)}
            className="rounded-full border border-white/16 bg-white/8 px-4 py-2 text-sm text-white/80 backdrop-blur"
            aria-label="Next slide"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
