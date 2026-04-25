import { initializeApp, getApps, applicationDefault, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let cached: App | null = null;

export function adminApp(): App {
  if (cached) return cached;
  const existing = getApps()[0];
  cached =
    existing ??
    initializeApp({
      credential: applicationDefault(),
      projectId: process.env.GCP_PROJECT_ID ?? process.env.GCLOUD_PROJECT,
    });
  return cached;
}

export function auth(): Auth {
  return getAuth(adminApp());
}

export function db(): Firestore {
  return getFirestore(adminApp());
}
