import express, { type Express } from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { mountRoutes } from "./routes";

export function buildApp(): Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors());
  app.use(express.json({ limit: "100kb" }));
  app.use(requestLogger);

  app.get("/healthz", (_req, res) => {
    res.json({ ok: true, data: { status: "healthy" } });
  });

  mountRoutes(app);

  app.use(errorHandler);
  return app;
}
