import { NextFunction, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";

import { env } from "../config/env.js";
import { AuthenticatedRequest, AuthUser } from "../types/api.js";
import { HttpError } from "../utils/http-error.js";

type AccessPayload = {
  sub: string;
  email: string;
  role?: "user" | "admin";
  type: "access";
};

export function signAccessToken(user: AuthUser) {
  const options: SignOptions = {
    expiresIn: env.ACCESS_TOKEN_TTL as SignOptions["expiresIn"]
  };

  return jwt.sign(
    { sub: String(user.id), email: user.email, role: user.role ?? "user", type: "access" },
    env.JWT_ACCESS_SECRET,
    options
  );
}

export function verifyAccessToken(token: string): AuthUser {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;

  if (payload.type !== "access") {
    throw new HttpError(401, "Invalid access token.", "INVALID_TOKEN");
  }

  return {
    id: Number(payload.sub),
    email: payload.email,
    role: payload.role ?? "user"
  };
}

function readBearerToken(request: AuthenticatedRequest) {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length);
}

export function requireAuth(request: AuthenticatedRequest, _response: Response, next: NextFunction) {
  const token = readBearerToken(request);
  if (!token) {
    next(new HttpError(401, "Authentication is required.", "AUTH_REQUIRED"));
    return;
  }

  try {
    request.auth = verifyAccessToken(token);
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired access token.", "INVALID_TOKEN"));
  }
}

export function requireAdmin(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  requireAuth(request, response, (error?: unknown) => {
    if (error) {
      next(error);
      return;
    }

    if (request.auth?.role !== "admin") {
      next(new HttpError(403, "Admin access is required.", "ADMIN_REQUIRED"));
      return;
    }

    next();
  });
}

export function optionalAuth(request: AuthenticatedRequest, _response: Response, next: NextFunction) {
  const token = readBearerToken(request);

  if (!token) {
    next();
    return;
  }

  try {
    request.auth = verifyAccessToken(token);
  } catch {
    next(new HttpError(401, "Invalid or expired access token.", "INVALID_TOKEN"));
    return;
  }

  next();
}
