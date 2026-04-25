import type { Response } from "express";
import type { ApiResult } from "@surr/shared";

export function ok<T>(res: Response, data: T, status = 200): void {
  const body: ApiResult<T> = { ok: true, data };
  res.status(status).json(body);
}
