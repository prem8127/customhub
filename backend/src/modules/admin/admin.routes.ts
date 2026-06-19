import { Router } from "express";
import { z } from "zod";

import { requireAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getProduct, listProducts } from "../products/products.service.js";
import {
  createAdminProductSchema,
  deleteAdminProductSchema,
  updateAdminProductSchema
} from "./admin.schemas.js";
import {
  createAdminProduct,
  deleteAdminProduct,
  updateAdminProduct
} from "./admin.products.service.js";
import { listAdminOrders, updateOrderStatus } from "./admin.orders.service.js";

const updateOrderStatusSchema = z.object({
  body: z.object({ status: z.string().min(1) }),
  params: z.object({ orderId: z.string().min(1) })
});

export const adminRouter = Router();

adminRouter.use("/admin", requireAdmin);

adminRouter.get(
  "/admin/products",
  asyncHandler(async (request, response) => {
    response.json(await listProducts({ ...(request.query as Record<string, string>), includeHidden: true }));
  })
);

adminRouter.get(
  "/admin/products/:productId",
  asyncHandler(async (request, response) => {
    response.json(await getProduct(request.params.productId, { includeHidden: true }));
  })
);

adminRouter.post(
  "/admin/products",
  validate(createAdminProductSchema),
  asyncHandler(async (request, response) => {
    response.status(201).json(await createAdminProduct(request.body));
  })
);

adminRouter.put(
  "/admin/products/:productId",
  validate(updateAdminProductSchema),
  asyncHandler(async (request, response) => {
    response.json(await updateAdminProduct(request.params.productId, request.body));
  })
);

adminRouter.delete(
  "/admin/products/:productId",
  validate(deleteAdminProductSchema),
  asyncHandler(async (request, response) => {
    response.json(await deleteAdminProduct(request.params.productId));
  })
);

// ── Order Management ──────────────────────────────────────────────────────────

adminRouter.get(
  "/admin/orders",
  asyncHandler(async (request, response) => {
    const { page, limit, search } = request.query as Record<string, string | undefined>;
    response.json(
      await listAdminOrders({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search
      })
    );
  })
);

adminRouter.patch(
  "/admin/orders/:orderId/status",
  validate(updateOrderStatusSchema),
  asyncHandler(async (request, response) => {
    response.json(await updateOrderStatus(request.params.orderId, request.body.status));
  })
);
