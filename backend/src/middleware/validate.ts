import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";

import { HttpError } from "../utils/http-error.js";

export function validate(schema: AnyZodObject) {
  return (request: Request, _response: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: request.body,
        params: request.params,
        query: request.query
      });

      request.body = parsed.body ?? request.body;
      request.params = parsed.params ?? request.params;
      request.query = parsed.query ?? request.query;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new HttpError(400, "Validation failed.", "VALIDATION_ERROR", error.flatten()));
        return;
      }

      next(error);
    }
  };
}
