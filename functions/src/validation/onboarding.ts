import { isLanguage, type Language, type OnboardingRequest } from "@surr/shared";
import { ApiError } from "../utils/errors";

const MAX_LANGUAGES = 10;
const MAX_ARTISTS = 20;
const MAX_MOODS = 10;
const MAX_NAME_LEN = 80;

export interface OnboardingPayload {
  languages: Language[];
  artists: string[];
  moods: string[];
}

function asStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) {
    throw ApiError.badRequest(`${field} must be an array`);
  }
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") {
      throw ApiError.badRequest(`${field} must contain only strings`);
    }
    const trimmed = item.trim();
    if (!trimmed) continue;
    if (trimmed.length > MAX_NAME_LEN) {
      throw ApiError.badRequest(`${field} entries must be <= ${MAX_NAME_LEN} chars`);
    }
    out.push(trimmed);
  }
  return Array.from(new Set(out));
}

export function parseOnboardingPayload(body: unknown): OnboardingPayload {
  if (!body || typeof body !== "object") {
    throw ApiError.badRequest("Request body must be an object");
  }
  const raw = body as Partial<OnboardingRequest>;

  const languages = asStringArray(raw.languages, "languages").filter((l) => {
    if (!isLanguage(l)) {
      throw ApiError.badRequest(`Unsupported language code: ${l}`);
    }
    return true;
  }) as Language[];

  if (languages.length === 0) {
    throw ApiError.badRequest("Pick at least one language");
  }
  if (languages.length > MAX_LANGUAGES) {
    throw ApiError.badRequest(`Pick at most ${MAX_LANGUAGES} languages`);
  }

  const artists = asStringArray(raw.artists, "artists");
  if (artists.length === 0) {
    throw ApiError.badRequest("Pick at least one favorite artist");
  }
  if (artists.length > MAX_ARTISTS) {
    throw ApiError.badRequest(`Pick at most ${MAX_ARTISTS} artists`);
  }

  const moods = raw.moods === undefined ? [] : asStringArray(raw.moods, "moods");
  if (moods.length > MAX_MOODS) {
    throw ApiError.badRequest(`Pick at most ${MAX_MOODS} moods`);
  }

  return { languages, artists, moods };
}
