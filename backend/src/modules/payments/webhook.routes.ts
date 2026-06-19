import crypto from "crypto";
import { Router } from "express";
import express from "express";

import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../utils/http-error.js";
import { lineItemId, orderId } from "../../utils/ids.js";
import { serializeOrder } from "../../utils/serializers.js";
import { Prisma } from "@prisma/client";

export const webhookRouter = Router();

// Must use raw body for signature verification — mount BEFORE express.json()
webhookRouter.post(
  "/webhook/razorpay",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const signature = request.headers["x-razorpay-signature"] as string | undefined;

    if (!env.RAZORPAY_KEY_SECRET) {
      response.status(503).json({ message: "Webhook not configured." });
      return;
    }

    if (!signature) {
      response.status(400).json({ message: "Missing signature header." });
      return;
    }

    const body = request.body as Buffer;
    const expected = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (
      expected.length !== signature.length ||
      !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    ) {
      response.status(400).json({ message: "Signature mismatch." });
      return;
    }

    let event: { event: string; payload: Record<string, unknown> };
    try {
      event = JSON.parse(body.toString("utf8"));
    } catch {
      response.status(400).json({ message: "Invalid JSON body." });
      return;
    }

    if (event.event === "payment.captured") {
      try {
        const paymentEntity = (event.payload as any)?.payment?.entity ?? {};
        const razorpayOrderId: string = paymentEntity.order_id ?? "";
        const razorpayPaymentId: string = paymentEntity.id ?? "";
        const amountPaise: number = paymentEntity.amount ?? 0;
        const notesRaw = paymentEntity.notes ?? {};
        const userId: number | null = notesRaw.userId ? Number(notesRaw.userId) : null;

        if (!razorpayOrderId || !userId) {
          // Can't create order without these; acknowledge anyway so Razorpay doesn't retry
          response.json({ received: true, skipped: "missing_user_or_order" });
          return;
        }

        // Idempotency: skip if order already exists
        const existing = await prisma.order.findFirst({
          where: {
            paymentRef: {
              contains: razorpayOrderId
            }
          }
        });

        if (existing) {
          response.json({ received: true, orderId: existing.id });
          return;
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
          response.json({ received: true, skipped: "user_not_found" });
          return;
        }

        // Build a minimal order from the webhook payload
        // Items and shipping address from notes (set by frontend when creating Razorpay order)
        let items: unknown[] = [];
        let shippingAddress: Record<string, unknown> = {};
        try {
          if (notesRaw.items) items = JSON.parse(notesRaw.items as string);
          if (notesRaw.shippingAddress) shippingAddress = JSON.parse(notesRaw.shippingAddress as string);
        } catch {
          // fallback: empty items
        }

        const total = amountPaise; // stored in paise, same unit as product.price

        const order = await prisma.order.create({
          data: {
            id: orderId(),
            userId,
            status: "placed",
            total,
            paymentMethod: "razorpay",
            shippingAddress: shippingAddress as Prisma.InputJsonValue,
            items: (items.length ? items : []) as Prisma.InputJsonValue,
            paymentRef: JSON.stringify({ razorpayOrderId, razorpayPaymentId })
          }
        });

        console.log(`[webhook] Created order ${order.id} from payment.captured`);
        response.json({ received: true, orderId: order.id });
      } catch (error) {
        console.error("[webhook] Failed to create order:", error);
        // Return 200 anyway so Razorpay doesn't retry for server errors we'd repeat
        response.json({ received: true, error: "internal" });
      }
    } else {
      response.json({ received: true });
    }
  }
);
