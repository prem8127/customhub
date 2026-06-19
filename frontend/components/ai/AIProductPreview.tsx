"use client";

import { ChangeEvent, useId, useState } from "react";
import { motion } from "framer-motion";

import {
  generateMockProductPreview,
  PreviewGenerator
} from "@/lib/ai-preview";
import { FEATURES } from "@/lib/features";
import { PreviewCategory } from "@/lib/premium-types";
import { cn } from "@/lib/utils";

type AIProductPreviewProps = {
  productImage: string;
  category: PreviewCategory;
  className?: string;
  onGeneratePreview?: PreviewGenerator;
};

type PreviewStatus = "idle" | "loading" | "ready" | "error";

export function AIProductPreview({
  productImage,
  category,
  className,
  onGeneratePreview = generateMockProductPreview
}: AIProductPreviewProps) {
  const inputId = useId();
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [status, setStatus] = useState<PreviewStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  if (!FEATURES.aiPreview) {
    return null;
  }

  async function handlePreview() {
    if (!sourceImage) {
      setError("Upload a scene image before generating a preview.");
      setStatus("error");
      return;
    }

    try {
      setStatus("loading");
      setError(null);
      const nextPreview = await onGeneratePreview({
        baseImage: sourceImage,
        productImage,
        category
      });
      setPreviewImage(nextPreview);
      setStatus("ready");
    } catch (previewError) {
      setStatus("error");
      setError(previewError instanceof Error ? previewError.message : "Preview generation failed.");
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        return;
      }

      setSourceImage(reader.result);
      setPreviewImage(null);
      setStatus("idle");
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[2rem] border border-white/70 bg-white/82 p-5 shadow-soft backdrop-blur sm:p-6",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-steel">AI Preview</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Preview in real life
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-steel">
            Start with a lightweight mock overlay now and swap in an API-driven render pipeline later
            through the `onGeneratePreview` prop.
          </p>
        </div>
        <div className="rounded-full border border-line bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-600">
          {category}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <label
          htmlFor={inputId}
          className="group flex min-h-[20rem] cursor-pointer flex-col justify-between rounded-[1.7rem] border border-dashed border-slate-300 bg-slate-50 p-5 transition hover:border-slate-400 hover:bg-slate-100/70"
        >
          <div>
            <p className="text-sm font-semibold text-ink">Upload your environment image</p>
            <p className="mt-2 text-sm leading-6 text-steel">
              Use a room, desk, mirror or garage shot. The current version composites your product into
              the scene with a preset overlay layout.
            </p>
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-white bg-white shadow-sm">
            {sourceImage ? (
              <img
                src={sourceImage}
                alt="Uploaded scene"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_top,rgba(29,111,255,0.14),transparent_34%),linear-gradient(180deg,#ffffff_0%,#eef3fb_100%)] px-6 text-center text-sm text-steel">
                Tap or click to upload a real-world photo
              </div>
            )}
          </div>
          <input id={inputId} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
        </label>

        <div className="flex min-h-[20rem] flex-col rounded-[1.7rem] border border-white/70 bg-[linear-gradient(180deg,#fbfcff_0%,#f0f4fb_100%)] p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">Generated preview</p>
              <p className="mt-1 text-sm text-steel">Output image stays isolated from your existing product page.</p>
            </div>
            <button
              type="button"
              onClick={handlePreview}
              disabled={status === "loading"}
              className="rounded-full bg-gradient-to-r from-brand to-brandSoft px-5 py-3 text-sm font-semibold text-white shadow-card transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              Preview in Real Life
            </button>
          </div>

          <div className="mt-5 flex-1 overflow-hidden rounded-[1.35rem] border border-white bg-white">
            {status === "loading" ? (
              <motion.div
                initial={{ opacity: 0.45 }}
                animate={{ opacity: [0.45, 0.9, 0.45] }}
                transition={{ duration: 1.3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="flex h-full min-h-[16rem] flex-col justify-between bg-[linear-gradient(135deg,#eef3fb_0%,#ffffff_45%,#e9f0fb_100%)] p-6"
              >
                <div className="h-4 w-36 rounded-full bg-slate-200" />
                <div className="grid flex-1 place-items-center">
                  <div className="h-48 w-48 rounded-[2rem] bg-white/75 shadow-soft" />
                </div>
                <div className="h-4 w-56 rounded-full bg-slate-200" />
              </motion.div>
            ) : previewImage ? (
              <img
                src={previewImage}
                alt="Generated mock preview"
                className="aspect-[4/3] h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex h-full min-h-[16rem] items-center justify-center px-6 text-center text-sm leading-7 text-steel">
                Upload a scene image, then generate a preview. The module is ready for future AI API
                wiring without changing its external props.
              </div>
            )}
          </div>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
