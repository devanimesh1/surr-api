import type { Firestore } from "firebase-admin/firestore";
import type { User } from "@surr/shared";

export interface IdentityClaims {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export async function getOrCreateUser(db: Firestore, claims: IdentityClaims): Promise<User> {
  const ref = db.doc(`users/${claims.uid}`);
  const snap = await ref.get();
  if (!snap.exists) {
    const now = new Date().toISOString();
    const fresh: User = {
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
    await ref.set(fresh);
    return fresh;
  }
  const existing = snap.data() as User;
  await ref.update({ lastActiveAt: new Date().toISOString() });
  return existing;
}

export async function isOnboardingComplete(db: Firestore, uid: string): Promise<boolean> {
  const snap = await db.doc(`users/${uid}/onboarding/state`).get();
  return Boolean(snap.exists && snap.data()?.completed);
}
