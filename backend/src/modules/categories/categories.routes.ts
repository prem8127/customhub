import { Router } from "express";

import { requireAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { createCategorySchema } from "./categories.schemas.js";
import { createCategory, listCategories } from "./categories.service.js";

export const categoriesRouter = Router();

categoriesRouter.get(
  "/categories",
  asyncHandler(async (_request, response) => {
    response.json(await listCategories());
  })
);

categoriesRouter.post(
  "/admin/categories",
  requireAdmin,
  validate(createCategorySchema),
  asyncHandler(async (request, response) => {
    response.status(201).json(await createCategory(request.body));
  })
);
