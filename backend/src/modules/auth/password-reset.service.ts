import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../utils/http-error.js";

// Signed JWT used as reset token — no DB table needed
function signResetToken(userId: number, email: string): string {
  return jwt.sign(
    { sub: String(userId), email, type: "password-reset" },
    env.JWT_ACCESS_SECRET,
    { expiresIn: "1h" }
  );
}

function verifyResetToken(token: string): { userId: number; email: string } {
  let payload: { sub: string; email: string; type: string };
  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as typeof payload;
  } catch {
    throw new HttpError(400, "Reset link is invalid or has expired.", "INVALID_RESET_TOKEN");
  }

  if (payload.type !== "password-reset") {
    throw new HttpError(400, "Invalid token type.", "INVALID_RESET_TOKEN");
  }

  return { userId: Number(payload.sub), email: payload.email };
}

function createTransporter() {
  // If SMTP env vars provided use them, else use Ethereal-compatible test config
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }
    });
  }
  // Fallback: console-only (no email sent, token logged for dev)
  return null;
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // Always respond the same way — no user enumeration
  if (!user) return { sent: true };

  // Google-only accounts have no password; skip silently
  if (!user.passwordHash) return { sent: true };

  const token = signResetToken(user.id, user.email);
  const resetUrl = `${env.FRONTEND_ORIGIN}/reset-password?token=${token}`;

  const transporter = createTransporter();

  if (transporter) {
    await transporter.sendMail({
      from: env.SMTP_FROM ?? "CustomHub <no-reply@customhub.in>",
      to: user.email,
      subject: "Reset your CustomHub password",
      text: `Click the link below to reset your password. It expires in 1 hour.\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2 style="color:#9a1c4c">Reset your password</h2>
          <p>Click the button below to reset your CustomHub password. The link expires in <strong>1 hour</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#9a1c4c;color:#fff;padding:12px 24px;border-radius:24px;text-decoration:none;font-weight:600;margin:16px 0">
            Reset Password
          </a>
          <p style="color:#666;font-size:13px">If you did not request this, ignore this email.</p>
          <p style="color:#aaa;font-size:11px">Or copy: ${resetUrl}</p>
        </div>
      `
    });
  } else {
    // Dev fallback — log the token so you can test without SMTP
    console.log(`[DEV] Password reset token for ${user.email}:\n${resetUrl}`);
  }

  return { sent: true };
}

export async function resetPassword(token: string, newPassword: string) {
  const { userId, email } = verifyResetToken(token);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.email !== email) {
    throw new HttpError(400, "Reset link is invalid.", "INVALID_RESET_TOKEN");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash }
  });

  // Revoke all refresh tokens so other sessions are invalidated
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() }
  });

  return { reset: true };
}
