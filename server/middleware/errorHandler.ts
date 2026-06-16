import { Request, Response, NextFunction } from "express";
import { addLog } from "./logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const message = err?.message || "Internal server error";
  addLog("Gateway/API", `Unhandled error on ${req.method} ${req.path}: ${message}`, "ERROR");
  res.status(err.status || 500).json({ error: message });
}
