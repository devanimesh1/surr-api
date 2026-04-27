import request from "supertest";

interface FakeDoc {
  data: Record<string, unknown> | null;
}

const store: Record<string, FakeDoc> = {};

function fakeDoc(path: string) {
  return {
    get: async () => {
      const doc = store[path];
      const exists = Boolean(doc && doc.data);
      return {
        exists,
        data: () => (exists ? doc.data : undefined),
      };
    },
    set: async (data: Record<string, unknown>) => {
      store[path] = { data };
    },
    update: async (patch: Record<string, unknown>) => {
      store[path] = {
        data: { ...(store[path]?.data ?? {}), ...patch },
      };
    },
  };
}

const fakeFirestore = {
  doc: (path: string) => fakeDoc(path),
  runTransaction: async (
    fn: (tx: {
      update: (ref: ReturnType<typeof fakeDoc>, patch: Record<string, unknown>) => void;
      set: (ref: ReturnType<typeof fakeDoc>, data: Record<string, unknown>) => void;
    }) => Promise<void>,
  ) => {
    const ops: Array<() => Promise<void>> = [];
    await fn({
      update: (ref, patch) => {
        ops.push(() => ref.update(patch));
      },
      set: (ref, data) => {
        ops.push(() => ref.set(data));
      },
    });
    for (const op of ops) await op();
  },
};

const fakeAuth = {
  verifyIdToken: jest.fn(async (token: string) => {
    if (token === "good-token") {
      return {
        uid: "user-1",
        email: "user@example.com",
        name: "Test User",
        picture: "https://x/avatar.png",
      };
    }
    throw new Error("invalid token");
  }),
};

jest.mock("../../src/services/firebase", () => ({
  auth: () => fakeAuth,
  db: () => fakeFirestore,
  adminApp: () => ({}),
}));

import { buildApp } from "../../src/app";

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  fakeAuth.verifyIdToken.mockClear();
});

describe("GET /me", () => {
  it("requires a bearer token", async () => {
    const res = await request(buildApp()).get("/me");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("rejects invalid tokens", async () => {
    const res = await request(buildApp()).get("/me").set("authorization", "Bearer bad-token");
    expect(res.status).toBe(401);
  });

  it("bootstraps a fresh user with needsOnboarding=true", async () => {
    const res = await request(buildApp()).get("/me").set("authorization", "Bearer good-token");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.user).toMatchObject({
      uid: "user-1",
      email: "user@example.com",
      displayName: "Test User",
      tier: "free",
    });
    expect(res.body.data.needsOnboarding).toBe(true);
  });
});

describe("POST /me/onboarding", () => {
  it("requires auth", async () => {
    const res = await request(buildApp())
      .post("/me/onboarding")
      .send({ languages: ["en"], artists: ["X"] });
    expect(res.status).toBe(401);
  });

  it("400s on invalid payload", async () => {
    const res = await request(buildApp())
      .post("/me/onboarding")
      .set("authorization", "Bearer good-token")
      .send({ languages: [], artists: [] });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("BAD_REQUEST");
  });

  it("persists payload, marks onboarding complete, flips needsOnboarding", async () => {
    const app = buildApp();
    await request(app).get("/me").set("authorization", "Bearer good-token");

    const res = await request(app)
      .post("/me/onboarding")
      .set("authorization", "Bearer good-token")
      .send({
        languages: ["pa", "hi"],
        artists: ["Diljit Dosanjh", "Arijit Singh"],
        moods: ["chill"],
      });
    expect(res.status).toBe(200);
    expect(res.body.data.user.preferredLanguages).toEqual(["pa", "hi"]);
    expect(res.body.data.user.favoriteArtists).toEqual(["Diljit Dosanjh", "Arijit Singh"]);
    expect(res.body.data.needsOnboarding).toBe(false);

    const me = await request(app).get("/me").set("authorization", "Bearer good-token");
    expect(me.body.data.needsOnboarding).toBe(false);
  });
});
