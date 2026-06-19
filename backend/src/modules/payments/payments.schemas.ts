import { z } from "zod";

export const createPaymentOrderSchema = z.object({
  body: z.object({
    amount: z.coerce.number().int().positive("amount is required."),
    currency: z.string().min(3).default("INR"),
    notes: z.record(z.string()).optional().default({})
  })
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, "orderId is required."),
    paymentId: z.string().min(1, "paymentId is required."),
    signature: z.string().min(1, "signature is required.")  // No longer optional
  })
});
