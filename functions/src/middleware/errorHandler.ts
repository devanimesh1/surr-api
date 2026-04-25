import type { ErrorRequestHandler } from "express";
import { ApiError } from "../utils/errors";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    res.status(err.status).json({
      ok: false,
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  // Unknown / unexpected error
  console.error("[unhandled]", err);
  res.status(500).json({
    ok: false,
    error: {
      code: "INTERNAL",
      message: "Something went wrong",
    },
  });
};
