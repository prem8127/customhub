import { Router } from "express";

import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { googleAuthSchema, loginSchema, refreshSchema, registerSchema } from "./auth.schemas.js";
import {
  getRefreshCookieName,
  googleAuth,
  loginUser,
  refreshCookieOptions,
  registerUser,
  revokeRefreshToken,
  rotateRefreshToken
} from "./auth.service.js";

export const authRouter = Router();

function sendAuthResponse(response: import("express").Response, payload: Awaited<ReturnType<typeof registerUser>>) {
  response.cookie(getRefreshCookieName(), payload.refreshToken, refreshCookieOptions());
  response.json(payload);
}

authRouter.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (request, response) => {
    const payload = await registerUser(request.body);
    response.status(201);
    sendAuthResponse(response, payload);
  })
);

authRouter.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (request, response) => {
    sendAuthResponse(response, await loginUser(request.body));
  })
);

authRouter.post(
  "/google-auth",
  validate(googleAuthSchema),
  asyncHandler(async (request, response) => {
    sendAuthResponse(response, await googleAuth(request.body));
  })
);

authRouter.post(
  "/refresh",
  validate(refreshSchema),
  asyncHandler(async (request, response) => {
    const cookieToken = request.signedCookies?.[getRefreshCookieName()] as string | undefined;
    sendAuthResponse(response, await rotateRefreshToken(request.body?.refreshToken ?? cookieToken));
  })
);

authRouter.post(
  "/logout",
  asyncHandler(async (request, response) => {
    const cookieToken = request.signedCookies?.[getRefreshCookieName()] as string | undefined;
    await revokeRefreshToken(request.body?.refreshToken ?? cookieToken);
    response.clearCookie(getRefreshCookieName(), { path: "/api" });
    response.status(204).send();
  })
);
