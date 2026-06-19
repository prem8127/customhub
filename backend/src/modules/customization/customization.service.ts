import { v2 as cloudinary } from "cloudinary";

import { env } from "../../config/env.js";

export async function uploadDesign(input: { previewDataUrl: string }) {
  if (env.CLOUDINARY_URL) {
    cloudinary.config({ cloudinary_url: env.CLOUDINARY_URL });
    const uploaded = await cloudinary.uploader.upload(input.previewDataUrl, {
      folder: "customhub/designs",
      resource_type: "image"
    });

    return { url: uploaded.secure_url };
  }

  return {
    url: input.previewDataUrl,
    storage: "inline-dev"
  };
}

export function previewDesign(input: { productId?: string; asset?: string }) {
  return {
    preview: input.asset ?? "",
    productId: input.productId
  };
}
