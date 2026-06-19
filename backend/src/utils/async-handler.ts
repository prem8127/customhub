import { NextFunction, Request, Response } from "express";

export function asyncHandler(
  // Express request types are widened here so authenticated route handlers can attach request.auth.
  handler: (request: any, response: Response, next: NextFunction) => Promise<unknown>
) {
  return (request: Request, response: Response, next: NextFunction) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}
