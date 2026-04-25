export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(status: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static unauthenticated(message = "Authentication required"): ApiError {
    return new ApiError(401, "UNAUTHENTICATED", message);
  }
  static notFound(message = "Not found"): ApiError {
    return new ApiError(404, "NOT_FOUND", message);
  }
  static badRequest(message: string, details?: Record<string, unknown>): ApiError {
    return new ApiError(400, "BAD_REQUEST", message, details);
  }
  static rateLimited(retryAfterMs: number): ApiError {
    return new ApiError(429, "RATE_LIMITED", "Too many requests", { retryAfterMs });
  }
}
