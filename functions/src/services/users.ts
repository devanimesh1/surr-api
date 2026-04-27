import type { Firestore } from "firebase-admin/firestore";
import type { User } from "@surr/shared";

export interface IdentityClaims {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

function freshUser(claims: IdentityClaims, now: string): User {
  return {
    uid: claims.uid,
    email: claims.email ?? "",
    displayName: claims.displayName?.trim() || claims.email?.split("@")[0] || "Listener",
    photoURL: claims.photoURL ?? undefined,
    preferredLanguages: [],
    favoriteArtists: [],
    tier: "free",
    createdAt: now,
    lastActiveAt: now,
  };
}

export async function getOrCreateUser(db: Firestore, claims: IdentityClaims): Promise<User> {
  const ref = db.doc(`users/${claims.uid}`);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = new Date().toISOString();
    if (!snap.exists) {
      const fresh = freshUser(claims, now);
      tx.set(ref, fresh);
      return fresh;
    }
    const existing = snap.data() as User;
    tx.update(ref, { lastActiveAt: now });
    return existing;
  });
}

export async function isOnboardingComplete(db: Firestore, uid: string): Promise<boolean> {
  const snap = await db.doc(`users/${uid}/onboarding/state`).get();
  return Boolean(snap.exists && snap.data()?.completed);
}
