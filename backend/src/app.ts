import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import { env, isProduction } from "./config/env.js";
import { adminRouter } from "./modules/admin/admin.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { passwordResetRouter } from "./modules/auth/password-reset.routes.js";
import { categoriesRouter } from "./modules/categories/categories.routes.js";
import { customizationRouter } from "./modules/customization/customization.routes.js";
import { ordersRouter } from "./modules/orders/orders.routes.js";
import { paymentsRouter } from "./modules/payments/payments.routes.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { webhookRouter } from "./modules/payments/webhook.routes.js";
import { productsRouter } from "./modules/products/products.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(compression());

  // ── Health check
  app.use("/api", healthRouter);

  // ── Razorpay webhook must receive raw body — register BEFORE express.json() ──
  app.use("/api", webhookRouter);

  app.use(cookieParser(env.COOKIE_SECRET));
  const allowedOrigins = [
    env.FRONTEND_ORIGIN,
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3001",
    "http://localhost:3001"
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        const isAllowed =
          allowedOrigins.includes(origin) ||
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
          // Allow LAN access during dev only (e.g. testing from a phone on the same WiFi):
          // 192.168.x.x, 10.x.x.x, 172.16-31.x.x
          (!isProduction &&
            /^https?:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
              origin
            ));

        callback(null, isAllowed);
      },
      credentials: true
    })
  );
  app.use(express.json({ limit: "12mb" }));
  app.use(express.urlencoded({ extended: true, limit: "12mb" }));
  app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));
  app.use(morgan(isProduction ? "combined" : "dev"));
  app.use(
    "/api",
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  app.get("/", (_request, response) => {
    response.redirect(302, env.FRONTEND_ORIGIN);
  });

  const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts. Please wait 15 minutes before trying again.", code: "RATE_LIMITED" }
  });

  app.use("/api/login", authRateLimit);
  app.use("/api/register", authRateLimit);
  app.use("/api/google-auth", authRateLimit);
  app.use("/api/forgot-password", authRateLimit);
  app.use("/api/reset-password", authRateLimit);

  app.use("/api", authRouter);
  app.use("/api", passwordResetRouter);
  app.use("/api", categoriesRouter);
  app.use("/api", productsRouter);
  app.use("/api", adminRouter);
  app.use("/api", customizationRouter);
  app.use("/api", ordersRouter);
  app.use("/api", paymentsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
