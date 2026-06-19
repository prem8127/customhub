import { PreviewCategory } from "@/lib/premium-types";

const CATEGORY_LAYOUTS: Record<
  PreviewCategory,
  {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    radius: number;
    label: string;
    glow: string;
  }
> = {
  tshirt: {
    x: 0.22,
    y: 0.2,
    width: 0.4,
    height: 0.54,
    rotation: -0.14,
    radius: 44,
    label: "Lifestyle Tee Preview",
    glow: "rgba(29, 111, 255, 0.28)"
  },
  mobile: {
    x: 0.58,
    y: 0.18,
    width: 0.2,
    height: 0.52,
    rotation: 0.16,
    radius: 38,
    label: "Phone Case Preview",
    glow: "rgba(17, 182, 153, 0.28)"
  },
  bike: {
    x: 0.16,
    y: 0.5,
    width: 0.34,
    height: 0.22,
    rotation: -0.08,
    radius: 28,
    label: "Bike Accessory Preview",
    glow: "rgba(15, 23, 41, 0.22)"
  }
};

export type PreviewGeneratorInput = {
  baseImage: string;
  productImage: string;
  category: PreviewCategory;
};

export type PreviewGenerator = (input: PreviewGeneratorInput) => Promise<string>;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
    image.src = src;
  });
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function coverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number
) {
  const scale = Math.max(width / image.width, height / image.height);
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;
  const offsetX = (width - scaledWidth) / 2;
  const offsetY = (height - scaledHeight) / 2;

  context.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);
}

export const generateMockProductPreview: PreviewGenerator = async ({
  baseImage,
  productImage,
  category
}) => {
  const [sceneImage, overlayImage] = await Promise.all([loadImage(baseImage), loadImage(productImage)]);
  const canvas = document.createElement("canvas");
  const size = 1400;
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas rendering is not available in this browser.");
  }

  const layout = CATEGORY_LAYOUTS[category];

  coverImage(context, sceneImage, size, size);

  const sceneGradient = context.createLinearGradient(0, 0, size, size);
  sceneGradient.addColorStop(0, "rgba(10, 15, 32, 0.04)");
  sceneGradient.addColorStop(1, "rgba(255, 255, 255, 0.24)");
  context.fillStyle = sceneGradient;
  context.fillRect(0, 0, size, size);

  const panelX = layout.x * size;
  const panelY = layout.y * size;
  const panelWidth = layout.width * size;
  const panelHeight = layout.height * size;
  const panelCenterX = panelX + panelWidth / 2;
  const panelCenterY = panelY + panelHeight / 2;

  context.save();
  context.translate(panelCenterX, panelCenterY);
  context.rotate(layout.rotation);
  context.translate(-panelCenterX, -panelCenterY);

  context.shadowColor = layout.glow;
  context.shadowBlur = 64;
  context.shadowOffsetY = 24;
  context.fillStyle = "rgba(255, 255, 255, 0.14)";
  drawRoundedRect(context, panelX, panelY, panelWidth, panelHeight, layout.radius);
  context.fill();

  context.shadowColor = "rgba(15, 23, 41, 0.24)";
  context.shadowBlur = 48;
  context.shadowOffsetY = 36;
  context.fillStyle = "rgba(255, 255, 255, 0.9)";
  drawRoundedRect(context, panelX, panelY, panelWidth, panelHeight, layout.radius);
  context.fill();

  context.save();
  drawRoundedRect(context, panelX, panelY, panelWidth, panelHeight, layout.radius);
  context.clip();

  const inset = category === "bike" ? panelWidth * 0.06 : panelWidth * 0.08;
  context.drawImage(
    overlayImage,
    panelX + inset,
    panelY + inset,
    panelWidth - inset * 2,
    panelHeight - inset * 2
  );
  context.restore();

  context.lineWidth = 2;
  context.strokeStyle = "rgba(255, 255, 255, 0.68)";
  drawRoundedRect(context, panelX, panelY, panelWidth, panelHeight, layout.radius);
  context.stroke();
  context.restore();

  const chipWidth = 320;
  const chipHeight = 68;
  const chipX = size - chipWidth - 72;
  const chipY = 72;
  context.fillStyle = "rgba(255, 255, 255, 0.8)";
  drawRoundedRect(context, chipX, chipY, chipWidth, chipHeight, 34);
  context.fill();
  context.fillStyle = "#0f1729";
  context.font = "600 28px 'SF Pro Display', Inter, sans-serif";
  context.fillText(layout.label, chipX + 28, chipY + 43);

  return canvas.toDataURL("image/png", 0.92);
};
