import { NextFunction, Response } from "express";
import { AppRequest } from "../types/request";
import { ApiError } from "../utils/ApiError";

export function notFound(_req: AppRequest, res: Response) {
  res.status(404).json({ error: "Route not found" });
}

export function errorHandler(
  err: unknown,
  _req: AppRequest,
  res: Response,
  _next: NextFunction,
) {
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof Error) {
    return res.status(500).json({ error: err.message });
  }

  return res.status(500).json({ error: "Internal Server Error" });
}
