# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Insight (package name `insight`, repo `iqcs`) — a CS2 decision-making trainer inspired by FACEIT + chess.com move evaluation. Players are shown scenarios (video/screenshot/2D map) and pick decisions graded as Perfect/Excellent/Good/Blunder, with difficulty scaled by elo. Future roadmap (per `GEMINI.md`): tiered scenario packs based on recent tier 1/2/3 tournaments, some paid.

## Commands

- `npm run dev` — Next.js dev server
- `npm run build` / `npm start` — production build/serve
- `npm run lint` — `next lint` (config: `.eslintrc.json` extends `next/core-web-vitals`)
- `docker compose up -d` — start Postgres 15 on host port **5433** (db `iqcs`, user `user`, pw `password`); data persisted to `./data/db`
- `npx prisma migrate dev` — apply schema migrations (reads `DATABASE_URL` from `.env` via `prisma.config.ts` + `dotenv/config`)
- `npx prisma db seed` — seeds from JSON files in `public/data/` (runs `node --import tsx prisma/seed.ts`)
- No test framework configured.

## Architecture

Next.js 14 App Router + TypeScript + Tailwind. Two storage layers coexist and are **not** in sync — this is the key gotcha:

1. **JSON files in `public/data/`** (`packs.json`, `scenarios.json`, `users.json`) — what the API routes under `src/app/api/**` actually read/write via `fs/promises`. All current CRUD (GET/POST/PUT/DELETE for packs, scenarios, users) goes through these files. IDs are auto-incremented by scanning the array max.
2. **Prisma + Postgres** (`prisma/schema.prisma`) — declared models `User`, `Account`, `Session`, `VerificationToken`, `Pack`, `Scenario`. `prisma/seed.ts` uses `@prisma/adapter-pg` to load the JSON files into Postgres. Nothing in the request path uses Prisma yet — the DB is set up but not wired into routes. When porting a route to Prisma, migrate IDs from numeric-in-JSON to `cuid` strings (schema already expects strings).

### Auth

- NextAuth in `src/app/api/auth/[...nextauth]/route.ts` with three providers: `CredentialsProvider` (hardcoded mock users `test@example.com` / `admin@example.com`, both password `password`), Google, and Steam (`next-auth-steam`). JWT callback copies `user.role` onto the token; session callback copies it onto `session.user.role` and attaches Steam profile under `session.user.steam`.
- Route protection lives in `src/middleware.ts`: matcher `["/admin/:path*", "/profile"]`. Any authenticated user reaches `/profile`; `/admin` additionally requires `token.role === "admin"` (non-admins are redirected to `/`).
- Type augmentation in `src/types/next-auth.d.ts`.

### Scenario data model

A `Pack` has many `Scenario`s. Each scenario carries three decision axes stored as JSON: `macro`, `micro`, `communication` (each `{title, description}`), plus `options: {id, text, isCorrect, feedback}[]`. `src/components/ScenarioView.tsx` is the player-side component: shows the three axes, lets the user pick one option, reveals correctness + feedback, advances to next. `src/components/Scenario.tsx` is an older/alt variant.

### Routes

- Public: `/` (home), `/signin`, `/packs`, `/packs/[id]`, `/play/[id]`
- Auth-required: `/profile`
- Admin-only: `/admin`, `/admin/packs`, `/admin/users` (forms in `src/components/admin/`)
- API: `/api/packs`, `/api/packs/[id]`, `/api/packs/[id]/[packId]/scenarios`, `/api/scenarios`, `/api/scenarios/[id]`, `/api/users`, `/api/users/[id]`

### TS paths

`@/*` → `src/*` (see `tsconfig.json`).

## Conventions

- Author is French; `GEMINI.md` is in French. UI strings in code are mostly English.
- When adding a new entity touching persistence, update **both** the JSON-file API route and the Prisma schema/seed so the two layers stay convertible.
