export type Language = "pa" | "hi" | "ta" | "te" | "ml" | "mr" | "bn" | "haryanvi" | "en" | "es";

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
