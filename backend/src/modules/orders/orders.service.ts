import { Prisma } from "@prisma/client";

import { prisma } from "../../db/prisma.js";
import { verifyPayment } from "../payments/payments.service.js";
import { Address } from "../../types/api.js";
import { HttpError } from "../../utils/http-error.js";
import { lineItemId, orderId } from "../../utils/ids.js";
import { serializeOrder } from "../../utils/serializers.js";

type CartPayloadItem = {
  id?: string;
  product: {
    id: string;
  };
  quantity?: number;
  customization?: unknown;
};

async function normalizeItems(items: CartPayloadItem[]) {
  const normalized = [];
  let total = 0;

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.product.id }
    });

    if (!product) {
      continue;
    }

    const quantity = Math.max(Number(item.quantity ?? 1), 1);
    normalized.push({
      id: item.id ?? lineItemId(),
      product: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        price: product.price,
        badge: product.badge,
        ...(product.summary ? { summary: product.summary } : {})
      },
      quantity,
      customization: item.customization
    });
    total += product.price * quantity;
  }

  return { items: normalized, total };
}

export async function createOrder(input: {
  items: CartPayloadItem[];
  shippingAddress: Address;
  paymentMethod: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  userId: number;
}) {
  // Re-verify payment signature on the backend before creating any order
  // This is the authoritative check — the frontend verification is just UX
  const { verified } = verifyPayment({
    orderId: input.razorpayOrderId,
    paymentId: input.razorpayPaymentId,
    signature: input.razorpaySignature
  });

  if (!verified) {
    throw new HttpError(400, "Payment could not be verified. Order not created.", "PAYMENT_NOT_VERIFIED");
  }

  const { items, total } = await normalizeItems(input.items);

  if (!items.length) {
    throw new HttpError(400, "No valid products found in order.", "NO_VALID_PRODUCTS");
  }

  // Save address to user profile
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  const addresses = Array.isArray(user?.addresses) ? user.addresses : [];

  await prisma.user.update({
    where: { id: input.userId },
    data: {
      addresses: [
        ...addresses.filter((address: unknown) => {
          if (!address || typeof address !== "object" || !("id" in address)) {
            return true;
          }
          return (address as { id?: string }).id !== input.shippingAddress.id;
        }),
        input.shippingAddress
      ] as Prisma.InputJsonValue
    }
  });

  const order = await prisma.order.create({
    data: {
      id: orderId(),
      userId: input.userId,
      status: "placed",
      total,
      paymentMethod: input.paymentMethod,
      shippingAddress: input.shippingAddress as Prisma.InputJsonValue,
      items: items as Prisma.InputJsonValue,
      // Store payment reference for audit trail
      paymentRef: JSON.stringify({
        razorpayOrderId: input.razorpayOrderId,
        razorpayPaymentId: input.razorpayPaymentId
      })
    }
  });

  return serializeOrder(order);
}

export async function listOrders(userId: number) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  return orders.map(serializeOrder);
}
