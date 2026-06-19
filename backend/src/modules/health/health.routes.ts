import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import nodemailer from "nodemailer";
import Razorpay from "razorpay";

import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";

export const healthRouter = Router();

type CheckResult = { status: "ok" | "fail" | "skipped"; detail?: string };

// Lightweight liveness check (fast, no external calls) — use for uptime pings.
healthRouter.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

async function checkDatabase(): Promise<CheckResult> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok" };
  } catch (error) {
    return { status: "fail", detail: error instanceof Error ? error.message : "Unknown database error" };
  }
}

function checkJwtSecrets(): CheckResult {
  return env.JWT_ACCESS_SECRET.length >= 16 && env.JWT_REFRESH_SECRET.length >= 16
    ? { status: "ok" }
    : { status: "fail", detail: "JWT secrets missing or too short" };
}

// Actually calls Google's token endpoint to confirm the client ID/secret
// pair is valid, rather than just checking the env vars are non-empty.
async function checkGoogleOAuth(): Promise<CheckResult> {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return { status: "skipped", detail: "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set" };
  }
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: "healthcheck-invalid-code",
        redirect_uri: env.GOOGLE_REDIRECT_URI ?? ""
      })
    });
    const body = (await response.json()) as { error?: string };
    // Google always rejects this fake code. "invalid_grant" means the
    // client_id/secret pair was accepted and only the code was bad — i.e.
    // credentials are valid. "invalid_client" means the credentials themselves
    // are wrong.
    if (body.error === "invalid_client") {
      return { status: "fail", detail: "Google rejected client_id/client_secret" };
    }
    return { status: "ok" };
  } catch (error) {
    return { status: "fail", detail: error instanceof Error ? error.message : "Could not reach Google" };
  }
}

// Pings Razorpay's API with the configured key to confirm it authenticates.
async function checkRazorpay(): Promise<CheckResult> {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return { status: "skipped", detail: "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set — payments disabled" };
  }
  try {
    const client = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
    // Cheap read-only call — lists at most 1 payment, just to verify auth.
    await client.payments.all({ count: 1 });
    return { status: "ok" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Razorpay auth failed";
    return { status: "fail", detail: message };
  }
}

// Calls Cloudinary's `ping` API to confirm the configured credentials work.
async function checkCloudinary(): Promise<CheckResult> {
  if (!env.CLOUDINARY_URL) {
    return { status: "skipped", detail: "CLOUDINARY_URL not set — image uploads disabled" };
  }
  try {
    cloudinary.config(true); // re-read CLOUDINARY_URL from env
    const result = await cloudinary.api.ping();
    return result.status === "ok" ? { status: "ok" } : { status: "fail", detail: JSON.stringify(result) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cloudinary auth failed";
    return { status: "fail", detail: message };
  }
}

// Opens a real SMTP connection (no email sent) to confirm credentials work.
async function checkEmail(): Promise<CheckResult> {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return { status: "skipped", detail: "SMTP not fully configured — reset links will log to stdout" };
  }
  try {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }
    });
    await transporter.verify();
    return { status: "ok" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "SMTP auth failed";
    return { status: "fail", detail: message };
  }
}

function checkAdminSeed(): CheckResult {
  return env.ADMIN_EMAIL && env.ADMIN_PASSWORD
    ? { status: "ok" }
    : { status: "skipped", detail: "ADMIN_EMAIL / ADMIN_PASSWORD not set" };
}

// Deep readiness check — makes a real authenticated call to every configured
// integration (DB, Google, Razorpay, Cloudinary, SMTP) so you know the actual
// keys work, not just that the env vars are non-empty.
healthRouter.get("/health/full", async (_req, res) => {
  const [database, googleOAuth, razorpay, cloudinary, email] = await Promise.all([
    checkDatabase(),
    checkGoogleOAuth(),
    checkRazorpay(),
    checkCloudinary(),
    checkEmail()
  ]);

  const checks = {
    database,
    jwtSecrets: checkJwtSecrets(),
    googleOAuth,
    razorpay,
    cloudinary,
    email,
    adminSeed: checkAdminSeed()
  };

  const hasFailure = Object.values(checks).some((c) => c.status === "fail");

  res.status(hasFailure ? 503 : 200).json({
    status: hasFailure ? "degraded" : "ok",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    checks
  });
});
