# BigDogs

A multi-week weight loss challenge app. Participants set a committed weekly pace, log daily weigh-ins, and earn weekly placement points based on how reliably they hit their pace. The full scoring ruleset lives in [`weight-loss-challenge-ruleset.md`](./weight-loss-challenge-ruleset.md).

## Tech stack

| Layer            | Stack                                                                  |
|------------------|------------------------------------------------------------------------|
| Web app          | React 19, Vite, Tailwind, Radix UI, React Router                       |
| Marketing site   | Static HTML/CSS built via `build.sh`                                   |
| Shared package   | TypeScript types, Zod schemas, Supabase client factory                 |
| Backend          | Supabase (Postgres + Auth + RLS + Realtime + pgmq)                     |
| Edge functions   | Deno, deployed via Supabase Functions                                  |
| Monorepo         | pnpm workspaces                                                        |

## Repo layout

```
BigDogs/
├── apps/
│   ├── web/          # React app (the main product)
│   └── marketing/    # Static marketing site
├── packages/
│   └── shared/       # Shared TS types, Zod schemas, Supabase client
├── supabase/
│   ├── migrations/   # Postgres migrations
│   ├── seed.sql      # Local dev seed data
│   └── functions/    # Deno edge functions (entity-*, transaction-*, etc.)
└── docs/             # Architecture, data model, screen specs, setup
```

## Prerequisites

| Tool         | Version | Install                                                       |
|--------------|---------|---------------------------------------------------------------|
| Node.js      | >= 22   | [nodejs.org](https://nodejs.org)                              |
| pnpm         | >= 10   | `corepack enable && corepack prepare pnpm@latest --activate`  |
| Docker       | latest  | Required for the local Supabase stack                         |
| Supabase CLI | latest  | `brew install supabase/tap/supabase`                          |
| Deno         | >= 2    | `brew install deno` (only for running edge-function tests)    |

## Quick start

```bash
# 1. Clone and install
git clone https://github.com/jodad015/BigDogs.git
cd BigDogs
pnpm install

# 2. Start the local Supabase stack (Docker must be running)
pnpm db:start

# 3. Grab the local anon key and write .env.local at the repo root
pnpm db:status            # copy the "anon key" value
cat > .env.local <<'EOF'
VITE_SUPABASE_URL=http://127.0.0.1:54621
VITE_SUPABASE_ANON_KEY=<paste-anon-key-here>
EOF

# 4. (In a second terminal) serve edge functions
pnpm db:functions

# 5. (In a third terminal) start the web dev server
pnpm dev:web              # → http://localhost:5173
```

VS Code users can run **Tasks: Run Task → Start All** to start Supabase, edge functions, and the web app together.

## Seed accounts

`pnpm db:reset` runs migrations and seeds these users (password is `password` for all):

| Email                  | State                                                       |
|------------------------|-------------------------------------------------------------|
| `alice@bigdogs.app`    | In an active challenge ("Office BigDogs Q3", week 4)        |
| `carol@bigdogs.app`    | Same active challenge                                       |
| `dave@bigdogs.app`     | Same active challenge                                       |
| `bob@bigdogs.app`      | In an upcoming challenge ("Spring Throwdown", starts in 7d) |
| `eve@bigdogs.app`      | Same upcoming challenge, goal set                           |
| `frank@bigdogs.app`    | Same upcoming challenge, still onboarding                   |

Alice's account exercises the in-progress challenge UI; Bob's exercises the pre-start UI.

## Common commands

```bash
# Dev
pnpm dev:web              # Vite dev server
pnpm db:start             # Start local Supabase
pnpm db:stop              # Stop local Supabase
pnpm db:functions         # Serve edge functions
pnpm db:status            # Show URLs + anon/service keys

# Database
pnpm db:reset             # Drop + re-run migrations + seed
pnpm db:migration <name>  # Create a new migration file
pnpm db:types             # Regenerate TS types from the schema

# Build / verify
pnpm build                # Build shared + web
pnpm typecheck            # Type-check all packages
pnpm lint                 # Lint all packages
pnpm test                 # Shared package unit tests (Vitest)
pnpm test:functions       # Edge function tests (Deno)
pnpm test:e2e             # Web E2E tests (Playwright)
```

## Local ports

BigDogs uses the **546xx** range to avoid conflicting with other local Supabase projects.

| Service        | Port  |
|----------------|-------|
| API (REST)     | 54621 |
| Postgres       | 54622 |
| Studio         | 54623 |
| Inbucket       | 54624 |
| Web dev server | 5173  |

## Branching & PRs

- Feature branches off `develop`; PR back into `develop`. Never commit directly to `develop` or `main`.
- Migrations go in `supabase/migrations/` with a date-prefixed filename (`YYYYMMDD_<name>.sql`).
- After adding a migration, run `pnpm db:reset` locally and `pnpm db:types` to regenerate types.

## Deeper docs

- [`docs/SETUP.md`](./docs/SETUP.md) — full setup guide and troubleshooting
- [`docs/DATA_MODEL.md`](./docs/DATA_MODEL.md) — Postgres schema
- [`docs/SERVICE_ARCHITECTURE.md`](./docs/SERVICE_ARCHITECTURE.md) — edge function architecture
- [`docs/SCREEN_SPECS.md`](./docs/SCREEN_SPECS.md) — UI specs
- [`weight-loss-challenge-ruleset.md`](./weight-loss-challenge-ruleset.md) — scoring and rules
