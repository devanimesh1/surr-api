import { ApiError } from "../../src/utils/errors";

describe("ApiError", () => {
  it("stores status, code, message, and details", () => {
    const err = new ApiError(400, "BAD_REQUEST", "nope", { field: "x" });
    expect(err.status).toBe(400);
    expect(err.code).toBe("BAD_REQUEST");
    expect(err.message).toBe("nope");
    expect(err.details).toEqual({ field: "x" });
  });

  it("provides factory helpers", () => {
    const a = ApiError.unauthenticated();
    const b = ApiError.notFound();
    const c = ApiError.badRequest("oops");
    const d = ApiError.rateLimited(1234);
    expect(a.status).toBe(401);
    expect(b.status).toBe(404);
    expect(c.status).toBe(400);
    expect(d.status).toBe(429);
    expect(d.details).toEqual({ retryAfterMs: 1234 });
  });
});
