import { Router } from "express";
import type { MeResponse, OnboardingResponse, User } from "@surr/shared";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { db } from "../services/firebase";
import { getOrCreateUser, isOnboardingComplete } from "../services/users";
import { parseOnboardingPayload } from "../validation/onboarding";
import { ok } from "../utils/response";

export function meRouter(): Router {
  const r = Router();

  r.get("/", requireAuth, async (req, res, next) => {
    try {
      const claims = (req as AuthedRequest).user;
      const firestore = db();
      const [user, completed] = await Promise.all([
        getOrCreateUser(firestore, claims),
        isOnboardingComplete(firestore, claims.uid),
      ]);
      const body: MeResponse = { user, needsOnboarding: !completed };
      ok(res, body);
    } catch (err) {
      next(err);
    }
  });

  r.post("/onboarding", requireAuth, async (req, res, next) => {
    try {
      const claims = (req as AuthedRequest).user;
      const payload = parseOnboardingPayload(req.body);
      const firestore = db();
      const userRef = firestore.doc(`users/${claims.uid}`);
      const stateRef = firestore.doc(`users/${claims.uid}/onboarding/state`);
      const now = new Date().toISOString();

      await getOrCreateUser(firestore, claims);
      await firestore.runTransaction(async (tx) => {
        tx.update(userRef, {
          preferredLanguages: payload.languages,
          favoriteArtists: payload.artists,
          lastActiveAt: now,
        });
        tx.set(stateRef, {
          languages: payload.languages,
          artists: payload.artists,
          moods: payload.moods,
          completed: true,
          completedAt: now,
        });
      });

      const updatedSnap = await userRef.get();
      const user = updatedSnap.data() as User;
      const body: OnboardingResponse = { user, needsOnboarding: false };
      ok(res, body);
    } catch (err) {
      next(err);
    }
  });

  return r;
}
