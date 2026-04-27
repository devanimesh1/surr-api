export const LANGUAGES = [
  "pa",
  "hi",
  "ta",
  "te",
  "ml",
  "mr",
  "bn",
  "haryanvi",
  "en",
  "es",
] as const;

export type Language = (typeof LANGUAGES)[number];

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);
}

export interface Track {
  id: string;
  ytVideoId: string;
  ytTitle: string;
  ytChannel: string;
  durationSec: number;
  spotifyId?: string;
  isrc?: string;
  title: string;
  primaryArtist: string;
  artists: string[];
  language: Language;
  album?: string;
  releaseYear?: number;
  artworkUrl: string;
  popularity: number;
  embeddedAt?: string;
}

export interface Artist {
  id: string;
  name: string;
  languages: Language[];
  spotifyId?: string;
  imageUrl?: string;
}
