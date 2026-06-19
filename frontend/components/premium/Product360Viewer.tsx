"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import { FEATURES } from "@/lib/features";
import { Product360Frame } from "@/lib/premium-types";
import { cn } from "@/lib/utils";

type Product360ViewerProps = {
  images: Product360Frame[];
  alt?: string;
  className?: string;
  autoRotateMs?: number;
  dragSensitivity?: number;
  zoomOnHover?: boolean;
};

function normalizeFrame(frame: Product360Frame, index: number, alt: string) {
  if (typeof frame === "string") {
    return {
      src: frame,
      alt: `${alt} frame ${index + 1}`
    };
  }

  return {
    src: frame.src,
    alt: frame.alt ?? `${alt} frame ${index + 1}`
  };
}

function wrapIndex(index: number, total: number) {
  return ((index % total) + total) % total;
}

export function Product360Viewer({
  images,
  alt = "360 product view",
  className,
  autoRotateMs = 1800,
  dragSensitivity = 18,
  zoomOnHover = true
}: Product360ViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointerStateRef = useRef({
    active: false,
    x: 0,
    timestamp: 0
  });
  const inertiaVelocityRef = useRef(0);
  const accumulatorRef = useRef(0);
  const inertiaFrameRef = useRef<number | null>(null);

  const [frameIndex, setFrameIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [inView, setInView] = useState(false);
  const [loadedFrames, setLoadedFrames] = useState<Record<number, true>>({});

  const frames = useMemo(() => images.map((frame, index) => normalizeFrame(frame, index, alt)), [alt, images]);
  const totalFrames = frames.length;
  const currentFrame = frames[frameIndex];

  const preloadFrame = useCallback((index: number) => {
    const safeIndex = wrapIndex(index, totalFrames);
    const image = new Image();
    image.decoding = "async";
    image.loading = "lazy";
    image.src = frames[safeIndex].src;
  }, [frames, totalFrames]);

  const rotateWithDelta = useCallback((deltaX: number) => {
    if (totalFrames < 2) {
      return;
    }

    accumulatorRef.current += deltaX;
    const step = Math.trunc(accumulatorRef.current / dragSensitivity);

    if (step === 0) {
      return;
    }

    accumulatorRef.current -= step * dragSensitivity;
    setFrameIndex((current) => wrapIndex(current - step, totalFrames));
  }, [dragSensitivity, totalFrames]);

  const stopInertia = useCallback(() => {
    if (inertiaFrameRef.current) {
      window.cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = null;
    }
  }, []);

  const startInertia = useCallback(() => {
    stopInertia();

    const animate = () => {
      inertiaVelocityRef.current *= 0.92;

      if (Math.abs(inertiaVelocityRef.current) < 0.18) {
        inertiaVelocityRef.current = 0;
        inertiaFrameRef.current = null;
        return;
      }

      rotateWithDelta(inertiaVelocityRef.current);
      inertiaFrameRef.current = window.requestAnimationFrame(animate);
    };

    inertiaFrameRef.current = window.requestAnimationFrame(animate);
  }, [rotateWithDelta, stopInertia]);

  useEffect(() => {
    if (!FEATURES.product360) {
      return;
    }

    const element = containerRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      {
        threshold: 0.25
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!FEATURES.product360 || !inView || totalFrames === 0) {
      return;
    }

    preloadFrame(frameIndex);
    preloadFrame(frameIndex + 1);
    preloadFrame(frameIndex - 1);
  }, [frameIndex, inView, preloadFrame, totalFrames]);

  useEffect(() => {
    if (!FEATURES.product360 || !inView || isDragging || totalFrames < 2) {
      return;
    }

    const timerId = window.setInterval(() => {
      setFrameIndex((current) => wrapIndex(current + 1, totalFrames));
    }, autoRotateMs);

    return () => window.clearInterval(timerId);
  }, [autoRotateMs, inView, isDragging, totalFrames]);

  useEffect(() => {
    return () => {
      if (inertiaFrameRef.current) {
        window.cancelAnimationFrame(inertiaFrameRef.current);
      }
    };
  }, []);

  if (!FEATURES.product360 || totalFrames === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-3 shadow-soft backdrop-blur",
        className
      )}
    >
      <div
        className="relative overflow-hidden rounded-[1.6rem] bg-[radial-gradient(circle_at_top,rgba(29,111,255,0.14),transparent_34%),linear-gradient(180deg,#ffffff_0%,#eef3fb_100%)]"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          stopInertia();
          pointerStateRef.current = {
            active: true,
            x: event.clientX,
            timestamp: performance.now()
          };
          accumulatorRef.current = 0;
          setIsDragging(true);
        }}
        onPointerMove={(event) => {
          if (!pointerStateRef.current.active) {
            return;
          }

          const now = performance.now();
          const deltaX = event.clientX - pointerStateRef.current.x;
          const deltaTime = Math.max(now - pointerStateRef.current.timestamp, 8);
          pointerStateRef.current = {
            active: true,
            x: event.clientX,
            timestamp: now
          };
          inertiaVelocityRef.current = deltaX / deltaTime * 16;
          rotateWithDelta(deltaX);
        }}
        onPointerUp={(event) => {
          event.currentTarget.releasePointerCapture(event.pointerId);
          pointerStateRef.current.active = false;
          setIsDragging(false);
          startInertia();
        }}
        onPointerCancel={() => {
          pointerStateRef.current.active = false;
          setIsDragging(false);
          startInertia();
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{ touchAction: "pan-y" }}
      >
        {!loadedFrames[frameIndex] ? (
          <div className="absolute inset-0 animate-pulse bg-slate-100" />
        ) : null}

        <motion.img
          key={currentFrame.src}
          src={currentFrame.src}
          alt={currentFrame.alt}
          className="aspect-square w-full select-none object-cover"
          loading="lazy"
          decoding="async"
          draggable={false}
          initial={{ opacity: 0.24 }}
          animate={{
            opacity: 1,
            scale: isHovering && !isDragging && zoomOnHover ? 1.07 : 1
          }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          onLoad={() =>
            setLoadedFrames((current) => ({
              ...current,
              [frameIndex]: true
            }))
          }
        />

        <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-slate-200/80 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-600 shadow-sm">
          360 View
        </div>
        <div className="pointer-events-none absolute bottom-4 left-4 rounded-full border border-slate-200/80 bg-white/88 px-4 py-2 text-xs font-medium text-slate-600 shadow-sm">
          Drag to rotate
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 px-1">
        <div className="text-sm text-steel">
          Frame {frameIndex + 1} / {totalFrames}
        </div>
        <div className="flex flex-1 gap-1.5">
          {frames.map((frame, index) => (
            <button
              key={`${frame.src}-${index}`}
              type="button"
              onClick={() => setFrameIndex(index)}
              aria-label={`Show frame ${index + 1}`}
              className={cn(
                "h-1.5 flex-1 rounded-full transition",
                index === frameIndex ? "bg-slate-900" : "bg-slate-200"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
