import { Router } from "express";

import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { previewDesignSchema, uploadDesignSchema } from "./customization.schemas.js";
import { previewDesign, uploadDesign } from "./customization.service.js";

export const customizationRouter = Router();

customizationRouter.post(
  "/upload-design",
  validate(uploadDesignSchema),
  asyncHandler(async (request, response) => {
    response.json(await uploadDesign(request.body));
  })
);

customizationRouter.post(
  "/preview",
  validate(previewDesignSchema),
  asyncHandler(async (request, response) => {
    response.json(previewDesign(request.body));
  })
);
