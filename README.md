# Surr — API (`surr-api`)

Backend for **Surr** (सुर) — a multi-language music streaming app with AI-powered discovery.

> Companion repo: [`surr-web`](https://github.com/devanimesh1/surr-web) (frontend).
> Architecture: see `design/HLD.md` and `design/LLD.md` in the workspace.

## Stack

- pnpm workspace with three packages:
  - `functions/` — Firebase Cloud Functions (Node 20 + TypeScript), Express router, primary HTTP API
  - `services/worker/` — Cloud Run service (Node + TypeScript) for nightly cron + heavy AI batch jobs
  - `shared/` — TypeScript types shared between functions, worker, and the frontend
- Firebase Admin SDK (Auth + Firestore)
- Supabase (`@supabase/supabase-js`) for pgvector — wired in Phase 5
- Hugging Face Inference API (LaBSE 768-d embeddings) — wired in Phase 5
- Gemini 1.5 Flash for query parsing + playlist meta — wired in Phase 5
- YouTube Data API v3, Spotify Web API (client-credentials), LRCLIB — wired progressively
- Jest + supertest (unit + integration via Firebase emulator)
- ESLint + Prettier + Husky + lint-staged

## Quick start

```bash
pnpm install
cp .env.example functions/.env   # fill in once you have the Firebase project
pnpm --filter @surr/functions build
pnpm --filter @surr/functions test
pnpm emulators   # boots auth + firestore emulators on localhost
```

## Workspace scripts (root)

| Script                              | Purpose                               |
| ----------------------------------- | ------------------------------------- |
| `pnpm lint`                         | ESLint across all packages            |
| `pnpm typecheck`                    | `tsc --noEmit` across all packages    |
| `pnpm test`                         | Run all package test suites           |
| `pnpm build`                        | Build all packages                    |
| `pnpm format` / `pnpm format:check` | Prettier                              |
| `pnpm emulators`                    | Firebase emulators (auth + firestore) |

## API surface (current)

| Method | Path       | Auth            | Purpose                                                             |
| ------ | ---------- | --------------- | ------------------------------------------------------------------- |
| `GET`  | `/healthz` | none            | Liveness                                                            |
| `GET`  | `/me`      | Bearer ID token | Returns `{ user, needsOnboarding }`, creates user doc on first call |

The full API is defined in `design/LLD.md` §5 and is implemented progressively
in subsequent module PRs (auth/onboarding → search → library → playlists →
social → AI → recommendations → lyrics).

## Project structure

```
.
├── firebase.json           # functions + firestore + emulator config
├── .firebaserc             # default project = surr-app
├── firestore.rules         # security rules (writes are backend-only)
├── firestore.indexes.json
├── functions/
│   ├── src/
│   │   ├── index.ts        # exports `api` Cloud Function
│   │   ├── app.ts          # Express setup
│   │   ├── routes/         # /healthz, /me, …
│   │   ├── middleware/     # auth, errorHandler, requestLogger, rateLimit
│   │   ├── services/       # firebase, (later) supabase, gemini, huggingface, youtube, spotify
│   │   └── utils/          # errors, response helpers
│   └── test/
├── services/worker/        # Cloud Run cron worker
└── shared/src/types/       # @surr/shared
```

## Environment variables

See `.env.example`. Local secrets go in `functions/.env`. In production, use
`firebase functions:secrets:set <NAME>` so values are stored in Secret Manager
rather than committed.

## Deployment

- `firebase deploy --only functions,firestore:rules,firestore:indexes` (gated by `.github/workflows/deploy.yml` on `main`)
- `gcloud run deploy worker` for the Cloud Run service
- Both require a service account with the appropriate roles (Functions Developer + Cloud Run Admin + Firestore User).
