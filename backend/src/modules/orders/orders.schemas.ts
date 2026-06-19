import { z } from "zod";

const addressSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().min(1),
  phone: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1)
});

const cartItemSchema = z.object({
  id: z.string().optional(),
  product: z.object({
    id: z.string().min(1)
  }),
  quantity: z.coerce.number().int().positive().default(1),
  customization: z.unknown().optional()
});

export const createOrderSchema = z.object({
  body: z.object({
    items: z.array(cartItemSchema).min(1, "At least one item is required."),
    shippingAddress: addressSchema,
    paymentMethod: z.string().min(1).default("Razorpay UPI"),
    // Require verified payment IDs — order cannot be created without these
    razorpayOrderId: z.string().min(1, "Razorpay order ID is required."),
    razorpayPaymentId: z.string().min(1, "Razorpay payment ID is required."),
    razorpaySignature: z.string().min(1, "Razorpay signature is required.")
  })
});
