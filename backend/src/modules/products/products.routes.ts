import { Router } from "express";

import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { productDetailSchema, productListSchema } from "./products.schemas.js";
import { getProduct, listProducts } from "./products.service.js";

export const productsRouter = Router();

productsRouter.get(
  "/products",
  validate(productListSchema),
  asyncHandler(async (request, response) => {
    response.json(await listProducts(request.query as Parameters<typeof listProducts>[0]));
  })
);

productsRouter.get(
  "/product/:productId",
  validate(productDetailSchema),
  asyncHandler(async (request, response) => {
    response.json(await getProduct(request.params.productId));
  })
);

productsRouter.get(
  "/products/:productId",
  validate(productDetailSchema),
  asyncHandler(async (request, response) => {
    response.json(await getProduct(request.params.productId));
  })
);
