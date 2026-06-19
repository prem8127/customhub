import { Router } from "express";

import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { createPaymentOrderSchema, verifyPaymentSchema } from "./payments.schemas.js";
import { createPaymentOrder, verifyPayment } from "./payments.service.js";

export const paymentsRouter = Router();

paymentsRouter.post(
  "/create-order",
  validate(createPaymentOrderSchema),
  asyncHandler(async (request, response) => {
    response.json(await createPaymentOrder(request.body));
  })
);

paymentsRouter.post(
  "/verify-payment",
  validate(verifyPaymentSchema),
  asyncHandler(async (request, response) => {
    response.json(verifyPayment(request.body));
  })
);
