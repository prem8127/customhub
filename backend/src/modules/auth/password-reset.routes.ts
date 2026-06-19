import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { requestPasswordReset, resetPassword } from "./password-reset.service.js";

export const passwordResetRouter = Router();

const forgotSchema = z.object({
  body: z.object({
    email: z.string().email("A valid email is required.")
  })
});

const resetSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required."),
    password: z.string().min(8, "Password must be at least 8 characters.")
  })
});

passwordResetRouter.post(
  "/forgot-password",
  validate(forgotSchema),
  asyncHandler(async (request, response) => {
    // Always 200 — no user enumeration
    await requestPasswordReset(request.body.email);
    response.json({ message: "If that email is registered, a reset link has been sent." });
  })
);

passwordResetRouter.post(
  "/reset-password",
  validate(resetSchema),
  asyncHandler(async (request, response) => {
    response.json(await resetPassword(request.body.token, request.body.password));
  })
);
