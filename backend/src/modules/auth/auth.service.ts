import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import { env, isProduction } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { signAccessToken } from "../../middleware/auth.js";
import { HttpError } from "../../utils/http-error.js";
import { serializeUser } from "../../utils/serializers.js";

type TokenPairInput = {
  id: number;
  email: string;
  role?: string;
};

type RefreshPayload = {
  sub: string;
  jti: string;
  type: "refresh";
};

const refreshCookieName = "customhub_refresh";

function avatarFromName(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "CH";
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function refreshExpiry() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_TTL_DAYS);
  return expiresAt;
}

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    signed: true,
    path: "/api",
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  };
}

export function getRefreshCookieName() {
  return refreshCookieName;
}

async function createTokenPair(user: TokenPairInput) {
  const refreshId = crypto.randomUUID();
  const accessToken = signAccessToken({
    id: user.id,
    email: user.email,
    role: user.role === "admin" ? "admin" : "user"
  });
  const refreshOptions: SignOptions = {
    expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d` as SignOptions["expiresIn"]
  };
  const refreshToken = jwt.sign(
    { sub: String(user.id), jti: refreshId, type: "refresh" },
    env.JWT_REFRESH_SECRET,
    refreshOptions
  );

  await prisma.refreshToken.create({
    data: {
      id: refreshId,
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: refreshExpiry()
    }
  });

  return {
    token: accessToken,
    accessToken,
    refreshToken
  };
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new HttpError(409, "Email is already registered.", "EMAIL_EXISTS");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: input.email,
      passwordHash,
      avatar: avatarFromName(input.name),
      addresses: []
    }
  });

  return {
    ...(await createTokenPair(user)),
    user: serializeUser(user)
  };
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new HttpError(401, "Invalid credentials.", "INVALID_CREDENTIALS");
  }

  return {
    ...(await createTokenPair(user)),
    user: serializeUser(user)
  };
}

// ── Google OAuth2 (Authorization Code flow) ──────────────────────────────────
// Called with the "code" from the frontend after redirect.
export async function googleAuth(input: { code: string }) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new HttpError(503, "Google Sign-In is not configured on this server.", "GOOGLE_NOT_CONFIGURED");
  }

  const client = new OAuth2Client({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_REDIRECT_URI
  });

  // Exchange authorization code for tokens
  const { tokens } = await client.getToken(input.code);

  if (!tokens.id_token) {
    throw new HttpError(400, "Could not retrieve ID token from Google.", "GOOGLE_AUTH_FAILED");
  }

  // Verify and decode the ID token
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.GOOGLE_CLIENT_ID
  });
  const payload = ticket.getPayload();

  if (!payload?.email) {
    throw new HttpError(400, "Could not retrieve email from Google credential.", "GOOGLE_AUTH_FAILED");
  }

  const email = payload.email.toLowerCase();
  const name = (payload.name ?? payload.email).trim() || "Google User";

  const user = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: {
      name,
      email,
      passwordHash: await bcrypt.hash(`google-oauth:${email}:${Date.now()}`, 12),
      avatar: avatarFromName(name),
      addresses: []
    }
  });

  return {
    ...(await createTokenPair(user)),
    user: serializeUser(user)
  };
}

export async function rotateRefreshToken(refreshToken?: string) {
  if (!refreshToken) {
    throw new HttpError(401, "Refresh token is required.", "REFRESH_REQUIRED");
  }

  const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as RefreshPayload;
  if (payload.type !== "refresh") {
    throw new HttpError(401, "Invalid refresh token.", "INVALID_REFRESH");
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { id: payload.jti },
    include: { user: true }
  });

  if (
    !stored ||
    stored.revokedAt ||
    stored.expiresAt.getTime() < Date.now() ||
    stored.tokenHash !== hashToken(refreshToken)
  ) {
    throw new HttpError(401, "Invalid refresh token.", "INVALID_REFRESH");
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() }
  });

  return {
    ...(await createTokenPair(stored.user)),
    user: serializeUser(stored.user)
  };
}

export async function revokeRefreshToken(refreshToken?: string) {
  if (!refreshToken) {
    return;
  }

  try {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as RefreshPayload;
    await prisma.refreshToken.updateMany({
      where: { id: payload.jti },
      data: { revokedAt: new Date() }
    });
  } catch {
    return;
  }
}
