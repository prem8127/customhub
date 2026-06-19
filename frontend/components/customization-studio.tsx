"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  AlignJustify,
  Bold,
  ChevronDown,
  Image as ImageIcon,
  Italic,
  Layers,
  Palette,
  Plus,
  RotateCcw,
  RotateCw,
  Settings,
  Trash2,
  Type,
  Underline,
  Upload
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useCart } from "@/components/cart-provider";
import { getCategoryCardTheme } from "@/components/CategoryCard";
import { Product } from "@/lib/types";

// ── Constants ─────────────────────────────────────────────────────────────────
const swatches = ["#9a1c4c", "#2f252d", "#fbf7f8", "#176a58", "#9f909a", "#fff4f8"];
const productColors = ["#fff", "#2f252d", "#176a58"];
const sizes = ["S", "M", "L", "XL"];
const fonts = ["Open Sans", "Montserrat", "Playfair Display", "Pacifico", "Roboto Mono"];

const mobileTools: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Text", icon: Type },
  { label: "Image", icon: ImageIcon },
  { label: "Layers", icon: Layers },
  { label: "Colors", icon: Palette },
];

// ── Types ─────────────────────────────────────────────────────────────────────
type FabricCanvas = import("fabric").Canvas;
type FabricObject = import("fabric").FabricObject;

interface LayerItem {
  id: string;
  label: string;
  type: "text" | "image";
  obj: FabricObject;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 8);
}

// ── Component ─────────────────────────────────────────────────────────────────
export function CustomizationStudio({ product }: { product: Product }) {
  const { addItem } = useCart();
  const theme = getCategoryCardTheme(product.category);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFont, setActiveFont] = useState("Open Sans");
  const [activeColor, setActiveColor] = useState("#9a1c4c");
  const [fontSize, setFontSize] = useState(48);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedProductColor, setSelectedProductColor] = useState("#fff");
  const [activeTab, setActiveTab] = useState<"Text" | "Image">("Text");
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // ── Load Fabric.js dynamically (avoids SSR issues) ──────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return;
    let destroyed = false;

    import("fabric").then(({ Canvas, FabricText, Rect }) => {
      if (destroyed || !canvasRef.current) return;

      const canvas = new Canvas(canvasRef.current, {
        width: 520,
        height: 420,
        backgroundColor: "transparent",
        selection: true,
      });

      // Printable area boundary
      const boundary = new Rect({
        left: 100,
        top: 60,
        width: 320,
        height: 300,
        fill: "transparent",
        stroke: "#9a1c4c",
        strokeWidth: 1.5,
        strokeDashArray: [6, 4],
        selectable: false,
        evented: false,
        hoverCursor: "default",
      });
      canvas.add(boundary);

      fabricRef.current = canvas;
      setFabricLoaded(true);

      // Track selection
      canvas.on("selection:created", syncSelection);
      canvas.on("selection:updated", syncSelection);
      canvas.on("selection:cleared", () => setSelectedId(null));

      // Save history on object modifications
      canvas.on("object:modified", saveSnapshot);

      return () => {
        destroyed = true;
        canvas.dispose();
      };
    });

    return () => {
      destroyed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function syncSelection() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject() as FabricObject & { _customId?: string };
    if (active?._customId) {
      setSelectedId(active._customId);
    }
  }

  // ── Snapshot / undo history ──────────────────────────────────────────────────
  const saveSnapshot = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const json = JSON.stringify((canvas as any).toJSON(["_customId"]));
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, json];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  function undo() {
    if (historyIndex <= 0 || !fabricRef.current) return;
    const prev = history[historyIndex - 1];
    fabricRef.current.loadFromJSON(JSON.parse(prev)).then(() => {
      fabricRef.current?.renderAll();
      setHistoryIndex((i) => i - 1);
      rebuildLayers();
    });
  }

  function redo() {
    if (historyIndex >= history.length - 1 || !fabricRef.current) return;
    const next = history[historyIndex + 1];
    fabricRef.current.loadFromJSON(JSON.parse(next)).then(() => {
      fabricRef.current?.renderAll();
      setHistoryIndex((i) => i + 1);
      rebuildLayers();
    });
  }

  function rebuildLayers() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const objs = canvas
      .getObjects()
      .filter((o: FabricObject & { _customId?: string }) => o._customId)
      .map((o: FabricObject & { _customId?: string; text?: string }) => ({
        id: o._customId!,
        label: o.text ? String(o.text).slice(0, 18) : "Image",
        type: (o.text ? "text" : "image") as "text" | "image",
        obj: o,
      }));
    setLayers(objs);
  }

  // ── Add Text ────────────────────────────────────────────────────────────────
  async function addText() {
    if (!fabricRef.current) return;
    const { IText } = await import("fabric");
    const id = uid();
    const text = new IText("Your text here", {
      left: 180,
      top: 160,
      fontFamily: activeFont,
      fontSize,
      fill: activeColor,
      fontWeight: "bold",
      }) as unknown as FabricObject & { _customId: string };;
    text._customId = id;
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    fabricRef.current.renderAll();
    const newLayer: LayerItem = { id, label: "Your text here", type: "text", obj: text };
    setLayers((prev) => [...prev, newLayer]);
    setSelectedId(id);
    saveSnapshot();
  }

  // ── Upload image ─────────────────────────────────────────────────────────────
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !fabricRef.current) return;
    const url = URL.createObjectURL(file);
    const { FabricImage } = await import("fabric");
    const img = await FabricImage.fromURL(url);
    const id = uid();
    const scale = Math.min(200 / (img.width ?? 200), 200 / (img.height ?? 200));
    img.set({ left: 160, top: 120, scaleX: scale, scaleY: scale });
    (img as FabricObject & { _customId: string })._customId = id;
    fabricRef.current.add(img);
    fabricRef.current.setActiveObject(img);
    fabricRef.current.renderAll();
    const newLayer: LayerItem = { id, label: file.name.slice(0, 18), type: "image", obj: img };
    setLayers((prev) => [...prev, newLayer]);
    setSelectedId(id);
    saveSnapshot();
    e.target.value = "";
  }

  // ── Delete selected object ───────────────────────────────────────────────────
  function deleteSelected() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    const id = (active as FabricObject & { _customId?: string })._customId;
    canvas.remove(active);
    canvas.renderAll();
    if (id) setLayers((prev) => prev.filter((l) => l.id !== id));
    setSelectedId(null);
    saveSnapshot();
  }

  function deleteLayer(id: string) {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = layers.find((l) => l.id === id)?.obj;
    if (obj) canvas.remove(obj);
    canvas.renderAll();
    setLayers((prev) => prev.filter((l) => l.id !== id));
    saveSnapshot();
  }

  function selectLayer(id: string) {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = layers.find((l) => l.id === id)?.obj;
    if (obj) {
      canvas.setActiveObject(obj);
      canvas.renderAll();
      setSelectedId(id);
    }
  }

  // ── Update active text properties ────────────────────────────────────────────
  function applyFontToSelected(font: string) {
    setActiveFont(font);
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject() as FabricObject & { set?: Function; fontFamily?: string };
    if (obj?.set) {
      obj.set("fontFamily", font);
      canvas.renderAll();
      saveSnapshot();
    }
  }

  function applyColorToSelected(color: string) {
    setActiveColor(color);
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) {
      obj.set("fill", color);
      canvas.renderAll();
      saveSnapshot();
    }
  }

  function applyFontSize(size: number) {
    setFontSize(size);
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject() as FabricObject & { set?: Function };
    if (obj?.set) {
      obj.set("fontSize", size);
      canvas.renderAll();
      saveSnapshot();
    }
  }

  function toggleBold() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject() as FabricObject & { fontWeight?: string; set?: Function };
    if (!obj?.set) return;
    obj.set("fontWeight", obj.fontWeight === "bold" ? "normal" : "bold");
    canvas.renderAll();
    saveSnapshot();
  }

  function toggleItalic() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject() as FabricObject & { fontStyle?: string; set?: Function };
    if (!obj?.set) return;
    obj.set("fontStyle", obj.fontStyle === "italic" ? "normal" : "italic");
    canvas.renderAll();
    saveSnapshot();
  }

  function toggleUnderline() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject() as FabricObject & { underline?: boolean; set?: Function };
    if (!obj?.set) return;
    obj.set("underline", !obj.underline);
    canvas.renderAll();
    saveSnapshot();
  }

  // ── Export design as PNG data URL ────────────────────────────────────────────
  function exportDesign(): string {
    return fabricRef.current?.toDataURL({ format: "png", multiplier: 2 }) ?? "";
  }

  // ── Add to cart with design JSON ─────────────────────────────────────────────
  function handleAddToCart() {
    const canvas = fabricRef.current;
    const preview = exportDesign();
    const designJson = canvas ? JSON.stringify((canvas as any).toJSON(["_customId"])) : "";
    addItem(product, {
      message: designJson || "No design",
      textColor: activeColor,
      textFont: activeFont,
      size: selectedSize,
      productColor: selectedProductColor,
      preview,
    });
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)_300px]">

      {/* ── Left panel — tools ── */}
      <aside className="premium-panel-strong hidden rounded-[1.5rem] p-4 lg:block">
        {/* Tab switcher */}
        <div className="grid grid-cols-2 overflow-hidden rounded-[1rem] border border-line bg-white/55 text-sm font-semibold text-brand">
          {(["Text", "Image"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center justify-center gap-2 px-4 py-3 ${activeTab === tab ? "bg-brand text-white" : ""}`}
            >
              {tab === "Text" ? <Type className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Text" ? (
          <>
            <button
              onClick={addText}
              disabled={!fabricLoaded}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              <Plus className="h-5 w-5" /> Add Text
            </button>

            <div className="mt-6 space-y-5">
              {/* Font */}
              <label className="block">
                <span className="text-sm font-semibold text-brand">Font</span>
                <div className="premium-input mt-2 flex items-center justify-between rounded-xl px-4 py-2">
                  <select
                    value={activeFont}
                    onChange={(e) => applyFontToSelected(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                  >
                    {fonts.map((f) => <option key={f}>{f}</option>)}
                  </select>
                  <ChevronDown className="h-4 w-4 text-steel shrink-0" />
                </div>
              </label>

              {/* Size */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-brand">Size</span>
                  <span className="text-sm text-steel">{fontSize} px</span>
                </div>
                <input
                  type="range" min="16" max="120" value={fontSize}
                  onChange={(e) => applyFontSize(Number(e.target.value))}
                  className="w-full accent-brand"
                />
              </div>

              {/* Style buttons */}
              <div className="grid grid-cols-5 gap-2">
                {[
                  { icon: Bold, action: toggleBold },
                  { icon: Italic, action: toggleItalic },
                  { icon: Underline, action: toggleUnderline },
                  { icon: RotateCcw, action: undo },
                  { icon: RotateCw, action: redo },
                ].map(({ icon: Icon, action }, i) => (
                  <button key={i} onClick={action} className="grid h-11 place-items-center rounded-lg border border-line bg-white/70 text-brand hover:bg-brand hover:text-white transition">
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>

              {/* Color swatches */}
              <div>
                <span className="mb-2 block text-sm font-semibold text-brand">Text color</span>
                <div className="flex flex-wrap gap-2">
                  {swatches.map((swatch) => (
                    <button
                      key={swatch}
                      onClick={() => applyColorToSelected(swatch)}
                      className={`h-10 w-10 rounded-full border-2 shadow transition ${activeColor === swatch ? "border-brand scale-110" : "border-white"}`}
                      style={{ backgroundColor: swatch }}
                      aria-label={`Color ${swatch}`}
                    />
                  ))}
                  {/* Custom color picker */}
                  <label className="h-10 w-10 rounded-full border-2 border-dashed border-brand cursor-pointer grid place-items-center" title="Custom color">
                    <Palette className="h-4 w-4 text-brand" />
                    <input type="color" value={activeColor} onChange={(e) => applyColorToSelected(e.target.value)} className="sr-only" />
                  </label>
                </div>
              </div>

              {/* Delete */}
              {selectedId && (
                <button onClick={deleteSelected} className="flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100">
                  <Trash2 className="h-4 w-4" /> Delete selected
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!fabricLoaded}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              <Upload className="h-5 w-5" /> Upload Image
            </button>
            <p className="mt-3 text-xs text-steel text-center">PNG, JPG, SVG — max 5 MB</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            {selectedId && (
              <button onClick={deleteSelected} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                <Trash2 className="h-4 w-4" /> Remove image
              </button>
            )}
          </>
        )}
      </aside>

      {/* ── Centre — canvas ── */}
      <section className="premium-panel-strong rounded-[1.75rem] p-4 sm:p-6">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-line p-4 sm:p-6" style={{ backgroundColor: selectedProductColor }}>
          <div className="custom-grid absolute inset-0 opacity-50" />
          <div className="relative mx-auto flex min-h-[420px] max-w-[640px] flex-col items-center justify-center gap-4">
            {/* Product image behind canvas */}
            <div className="relative w-full" style={{ height: 420 }}>
              <Image
                src={theme.image}
                alt={product.name}
                fill
                sizes="640px"
                className="object-contain drop-shadow-[0_32px_46px_rgba(82,18,42,0.14)] pointer-events-none"
                priority
              />
              {/* Fabric canvas overlaid on top */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ touchAction: "none" }}
              />
              {!fabricLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm text-steel">Loading canvas…</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile tools strip */}
        <div className="mt-4 rounded-[1.45rem] border border-line bg-white/72 p-3 lg:hidden">
          <div className="grid grid-cols-4 gap-1 border-b border-line pb-2 text-sm font-semibold text-steel">
            {mobileTools.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setActiveTab(label as "Text" | "Image")}
                className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2 ${label === activeTab ? "text-brand" : ""}`}
              >
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={addText} disabled={!fabricLoaded} className="flex-1 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white disabled:opacity-40">+ Add Text</button>
            <button onClick={() => fileInputRef.current?.click()} disabled={!fabricLoaded} className="flex-1 rounded-full border border-line bg-white px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40">Upload Image</button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-steel">Size</span>
            <input type="range" min="16" max="120" value={fontSize} onChange={(e) => applyFontSize(Number(e.target.value))} className="flex-1 accent-brand" />
            <span className="text-xs text-steel w-8">{fontSize}px</span>
            <button onClick={undo} className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-brand"><RotateCcw className="h-4 w-4" /></button>
            <button onClick={redo} className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-brand"><RotateCw className="h-4 w-4" /></button>
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            {swatches.map((swatch) => (
              <button key={swatch} onClick={() => applyColorToSelected(swatch)} className={`h-9 w-9 rounded-full border-2 ${activeColor === swatch ? "border-brand" : "border-line"}`} style={{ backgroundColor: swatch }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Right panel — layers + options ── */}
      <aside className="premium-panel-strong rounded-[1.5rem] p-4">
        <div className="mb-5 flex items-center gap-3 text-brand">
          <AlignJustify className="h-5 w-5" />
          <Layers className="h-5 w-5" />
          <Settings className="h-5 w-5" />
        </div>
        <div className="space-y-5">
          {/* Size selector */}
          <div>
            <p className="mb-3 text-sm font-semibold text-brand">Size</p>
            <div className="grid grid-cols-4 gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-xl border px-3 py-3 font-semibold transition ${selectedSize === size ? "border-brand bg-brand text-white" : "border-line bg-white/70 text-ink"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Product color */}
          <div>
            <p className="mb-3 text-sm font-semibold text-brand">Product color</p>
            <div className="flex gap-3">
              {productColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedProductColor(c)}
                  className={`h-10 w-10 rounded-xl border-2 transition ${selectedProductColor === c ? "border-brand scale-110" : "border-line"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Layers list */}
          <div>
            <p className="mb-2 text-sm font-semibold text-brand">Layers</p>
            <div className="rounded-[1.25rem] border border-line bg-white/62 overflow-hidden">
              {layers.length === 0 ? (
                <p className="px-4 py-4 text-xs text-steel text-center">No layers yet — add text or upload an image.</p>
              ) : (
                layers.map(({ id, label, type: ltype }) => (
                  <div
                    key={id}
                    onClick={() => selectLayer(id)}
                    className={`flex items-center justify-between border-b border-line px-4 py-3 last:border-b-0 cursor-pointer ${selectedId === id ? "bg-brand/5" : ""}`}
                  >
                    <span className="flex items-center gap-3 font-semibold text-brand text-sm">
                      {ltype === "text" ? <Type className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                      {label}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); deleteLayer(id); }}>
                      <Trash2 className="h-4 w-4 text-brand hover:text-red-500" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Price */}
          <div className="rounded-[1.25rem] border border-line bg-white/62 p-4">
            <div className="flex items-end justify-between">
              <span className="text-sm font-semibold text-steel">Price</span>
              <span className="text-4xl font-bold text-ink">
                ₹{(product.price / 100).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Add to cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full rounded-full bg-brand px-5 py-4 text-base font-semibold text-white shadow-card"
          >
            Add to Cart
          </button>

          <Link
            href="/cart"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold text-brand"
          >
            <Upload className="h-4 w-4" />
            Review Cart
          </Link>
        </div>
      </aside>
    </div>
  );
}
