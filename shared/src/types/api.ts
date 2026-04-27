import type { Language } from "./track";
import type { User } from "./user";

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export interface MeResponse {
  user: User;
  needsOnboarding: boolean;
}

export interface OnboardingRequest {
  languages: Language[];
  artists: string[];
  moods?: string[];
}

export interface OnboardingResponse {
  user: User;
  needsOnboarding: false;
}
