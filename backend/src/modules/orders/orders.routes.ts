import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { AuthenticatedRequest } from "../../types/api.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { createOrderSchema } from "./orders.schemas.js";
import { createOrder, listOrders } from "./orders.service.js";

export const ordersRouter = Router();

ordersRouter.post(
  "/order",
  requireAuth,
  validate(createOrderSchema),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    response.status(201).json(
      await createOrder({
        ...request.body,
        userId: request.auth!.id
      })
    );
  })
);

ordersRouter.get(
  "/orders",
  requireAuth,
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    response.json(await listOrders(request.auth!.id));
  })
);
