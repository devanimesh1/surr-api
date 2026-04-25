import request from "supertest";
import { buildApp } from "../src/app";

describe("GET /healthz", () => {
  it("returns ok=true with status=healthy", async () => {
    const app = buildApp();
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, data: { status: "healthy" } });
  });
});

describe("Unknown routes", () => {
  it("returns 404 with default Express response", async () => {
    const app = buildApp();
    const res = await request(app).get("/__nope__");
    expect(res.status).toBe(404);
  });
});
