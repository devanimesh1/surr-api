import type { Express } from "express";
import { meRouter } from "./me";

export function mountRoutes(app: Express): void {
  app.use("/me", meRouter());
}
