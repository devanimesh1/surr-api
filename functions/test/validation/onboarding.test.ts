import { parseOnboardingPayload } from "../../src/validation/onboarding";
import { ApiError } from "../../src/utils/errors";

describe("parseOnboardingPayload", () => {
  it("trims, dedupes, and accepts a valid payload", () => {
    const out = parseOnboardingPayload({
      languages: ["pa", "pa", " hi "],
      artists: [" Diljit Dosanjh ", "Arijit Singh", "Diljit Dosanjh"],
      moods: ["happy", "chill"],
    });
    expect(out.languages).toEqual(["pa", "hi"]);
    expect(out.artists).toEqual(["Diljit Dosanjh", "Arijit Singh"]);
    expect(out.moods).toEqual(["happy", "chill"]);
  });

  it("defaults moods to [] when not provided", () => {
    const out = parseOnboardingPayload({
      languages: ["en"],
      artists: ["Taylor Swift"],
    });
    expect(out.moods).toEqual([]);
  });

  it("rejects non-object body", () => {
    expect(() => parseOnboardingPayload(null)).toThrow(ApiError);
    expect(() => parseOnboardingPayload("nope")).toThrow(ApiError);
  });

  it("rejects empty languages", () => {
    expect(() => parseOnboardingPayload({ languages: [], artists: ["X"] })).toThrow(
      /at least one language/i,
    );
  });

  it("rejects empty artists", () => {
    expect(() => parseOnboardingPayload({ languages: ["en"], artists: [] })).toThrow(
      /at least one favorite artist/i,
    );
  });

  it("rejects unsupported language code", () => {
    expect(() => parseOnboardingPayload({ languages: ["zz"], artists: ["X"] })).toThrow(
      /Unsupported language/,
    );
  });

  it("rejects non-string entries", () => {
    expect(() => parseOnboardingPayload({ languages: [123], artists: ["X"] })).toThrow(
      /must contain only strings/,
    );
  });

  it("rejects oversized entries", () => {
    const long = "a".repeat(200);
    expect(() => parseOnboardingPayload({ languages: ["en"], artists: [long] })).toThrow(/<=/);
  });

  it("rejects too many languages", () => {
    expect(() =>
      parseOnboardingPayload({
        languages: ["pa", "hi", "ta", "te", "ml", "mr", "bn", "haryanvi", "en", "es", "pa"],
        artists: ["X"],
      }),
    ).not.toThrow();
  });
});
