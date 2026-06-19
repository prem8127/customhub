import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required."),
    email: z.string().trim().email("A valid email is required.").transform((email) => email.toLowerCase()),
    password: z.string().min(8, "Password must be at least 8 characters.")
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("A valid email is required.").transform((email) => email.toLowerCase()),
    password: z.string().min(8, "Password must be at least 8 characters.")
  })
});

// Now accepts "code" (Authorization Code flow) instead of "credential" (Implicit flow)
export const googleAuthSchema = z.object({
  body: z.object({
    code: z.string().min(1, "Google authorization code is required.")
  })
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional()
  }).optional().default({})
});
