import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { db } from "../services/firebase";
import { ok } from "../utils/response";
import type { MeResponse, User } from "@surr/shared";

export function meRouter(): Router {
  const r = Router();

  r.get("/", requireAuth, async (req, res, next) => {
    try {
      const { uid, email, displayName, photoURL } = (req as AuthedRequest).user;
      const ref = db().doc(`users/${uid}`);
      const snap = await ref.get();
      let user: User;

      if (!snap.exists) {
        const now = new Date().toISOString();
        user = {
          uid,
          email: email ?? "",
          displayName: displayName ?? email?.split("@")[0] ?? "Listener",
          photoURL: photoURL ?? undefined,
          preferredLanguages: [],
          favoriteArtists: [],
          tier: "free",
          createdAt: now,
          lastActiveAt: now,
        };
        await ref.set(user);
      } else {
        user = snap.data() as User;
        await ref.update({ lastActiveAt: new Date().toISOString() });
      }

      const onboardingSnap = await db().doc(`users/${uid}/onboarding/state`).get();
      const needsOnboarding = !onboardingSnap.exists || !onboardingSnap.data()?.completed;

      const body: MeResponse = { user, needsOnboarding };
      ok(res, body);
    } catch (err) {
      next(err);
    }
  });

  return r;
}
