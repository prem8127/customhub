import crypto from "crypto";
import Razorpay from "razorpay";

import { env } from "../../config/env.js";
import { HttpError } from "../../utils/http-error.js";

export async function createPaymentOrder(input: {
  amount: number;
  currency: string;
  notes?: Record<string, string>;
}) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new HttpError(
      503,
      "Payment gateway is not configured. Please contact support.",
      "PAYMENT_NOT_CONFIGURED"
    );
  }

  const client = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET
  });

  const order = await client.orders.create({
    amount: input.amount,
    currency: input.currency,
    payment_capture: true,
    notes: input.notes ?? {}
  } as any);

  const razorpayOrder = order as unknown as { id: string; amount: number; currency: string };

  return {
    id: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    gateway: "razorpay",
    key: env.RAZORPAY_KEY_ID
  };
}

export function verifyPayment(input: { orderId: string; paymentId: string; signature: string }) {
  if (!env.RAZORPAY_KEY_SECRET) {
    throw new HttpError(
      503,
      "Payment gateway is not configured. Cannot verify payment.",
      "PAYMENT_NOT_CONFIGURED"
    );
  }

  if (!input.signature) {
    throw new HttpError(400, "Payment signature is required.", "MISSING_SIGNATURE");
  }

  const body = `${input.orderId}|${input.paymentId}`;
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(input.signature);

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    throw new HttpError(400, "Payment signature verification failed.", "PAYMENT_NOT_VERIFIED");
  }

  return { verified: true };
}
