import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { buildApp } from "./app";

setGlobalOptions({
  region: "us-central1",
  maxInstances: 10,
  memory: "256MiB",
});

export const api = onRequest({ cors: true }, buildApp());
