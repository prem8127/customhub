import crypto from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

import { env } from "../../config/env.js";
import { HttpError } from "../../utils/http-error.js";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageBytes = 4 * 1024 * 1024;
const uploadDir = path.join(process.cwd(), "public", "uploads");

type UploadedImage = {
  name?: string;
  dataUrl: string;
};

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,([a-zA-Z0-9+/=]+)$/);
  if (!match) {
    throw new HttpError(400, "Invalid image format.", "INVALID_IMAGE");
  }

  const mimeType = match[1];
  const buffer = Buffer.from(match[2], "base64");

  if (!allowedTypes.has(mimeType) || buffer.length > maxImageBytes) {
    throw new HttpError(400, "Image must be PNG, JPEG, or WEBP under 4MB.", "IMAGE_VALIDATION_FAILED");
  }

  return { mimeType, buffer };
}

function extensionFor(mimeType: string) {
  return mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
}

export async function persistProductImages(images: UploadedImage[] = []) {
  if (images.length > 8) {
    throw new HttpError(400, "A product can have up to 8 images.", "TOO_MANY_IMAGES");
  }

  const uploaded: string[] = [];

  for (const image of images) {
    const { mimeType, buffer } = parseDataUrl(image.dataUrl);

    if (env.CLOUDINARY_URL) {
      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "customhub/products",
            resource_type: "image",
            allowed_formats: ["jpg", "jpeg", "png", "webp"]
          },
          (error, result) => {
            if (error || !result) {
              reject(error ?? new Error("Cloudinary upload failed"));
              return;
            }
            resolve({ secure_url: result.secure_url });
          }
        );
        stream.end(buffer);
      });

      uploaded.push(result.secure_url);
      continue;
    }

    await mkdir(uploadDir, { recursive: true });
    const filename = `${crypto.randomUUID()}.${extensionFor(mimeType)}`;
    await writeFile(path.join(uploadDir, filename), buffer);
    uploaded.push(`/uploads/${filename}`);
  }

  return uploaded;
}
