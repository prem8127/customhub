import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";

import { isProduction } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

export function notFoundHandler(request: Request, _response: Response, next: NextFunction) {
  next(new HttpError(404, `Route not found: ${request.method} ${request.path}`, "NOT_FOUND"));
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      error: error.message,
      code: error.code,
      details: error.details
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    response.status(400).json({
      error: "Database request failed.",
      code: error.code
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    error: "Internal server error.",
    code: "INTERNAL_ERROR",
    details: isProduction ? undefined : error instanceof Error ? error.message : error
  });
}
