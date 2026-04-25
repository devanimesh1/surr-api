import type { Language } from "./track";

export type Tier = "free" | "pro";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferredLanguages: Language[];
  favoriteArtists: string[];
  tier: Tier;
  createdAt: string;
  lastActiveAt: string;
}

export interface OnboardingAnswers {
  languages: Language[];
  artists: string[];
  moods?: string[];
  completed: boolean;
  completedAt?: string;
}

export interface LikeEdge {
  trackId: string;
  likedAt: string;
}

export interface HistoryEvent {
  id: string;
  trackId: string;
  playedAt: string;
  durationMs: number;
  completed: boolean;
}
