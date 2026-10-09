# BigDogs

Leaderboards for the dumb games your office plays. Dead hangs, hallway putting,
pull-ups, paper planes, cornhole doubles: if people argue about who's best,
BigDogs keeps score.

- A **platform admin** creates **organizations**. People can belong to several.
- Any member can create a **leaderboard**. Leaderboards are configuration, not
  code: pick what's measured (time, count, points, distance, weight, X of Y),
  whether higher or lower wins, how entries combine (best, total, average,
  latest, most entries), a default time window, and whether it's for players
  or teams.
- **Players** are separate from accounts. Add a coworker by name, log their
  scores, and they claim the player when they sign up.
- **Teams** are fixed rosters of players; one player can be on many teams.
- **TV mode** shows an org's boards on an office display through a read-only
  link, no sign-in needed.

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the data model and
permission rules, and [docs/DEPLOYMENT_SETUP.md](./docs/DEPLOYMENT_SETUP.md)
for environments and deploys.

## Tech stack

| Layer          | Stack                                                       |
|----------------|-------------------------------------------------------------|
| Web app        | React 19, Vite, Tailwind, React Router                      |
| Marketing site | Static HTML/CSS built via `build.sh`                        |
| Shared package | Generated DB types, Zod schemas, leaderboard formatting     |
| Backend        | Supabase: Postgres + RLS + RPC functions, Auth, Realtime    |
| Hosting        | Supabase (DB/Auth), Cloudflare Pages (web + marketing)      |
| Monorepo       | pnpm workspaces                                             |

There are no edge functions. The web app talks to Postgres directly through
supabase-js; row level security and a handful of SQL functions enforce the
rules.

## Repo layout

```
BigDogs/
├── apps/
│   ├── web/          # React app
│   └── marketing/    # Static marketing site
├── packages/
│   └── shared/       # DB types, validation, leaderboard config + formatting
├── supabase/
│   ├── migrations/   # Postgres migrations (schema, RLS, functions)
│   └── seed.sql      # Local dev seed data
└── docs/
```

## Prerequisites

| Tool         | Version | Install                                                      |
|--------------|---------|--------------------------------------------------------------|
| Node.js      | >= 22   | [nodejs.org](https://nodejs.org)                             |
| pnpm         | >= 10   | `corepack enable && corepack prepare pnpm@latest --activate` |
| Docker       | latest  | Required for the local Supabase stack                        |
| Supabase CLI | latest  | `brew install supabase/tap/supabase`, or use `npx supabase`  |

## Quick start

```bash
# 1. Install
pnpm install

# 2. Start the local Supabase stack (Docker must be running).
#    Applies migrations and seed data.
pnpm db:start

# 3. Write .env.local at the repo root with the local URL and anon key
pnpm db:status            # copy the anon key
cat > .env.local <<'EOF'
VITE_SUPABASE_URL=http://127.0.0.1:54621
VITE_SUPABASE_ANON_KEY=<paste-anon-key-here>
EOF

# 4. Start the web app
pnpm dev:web              # → http://localhost:5180
```

VS Code users can run **Tasks: Run Task → Start All**.

## Seed data

`pnpm db:reset` re-runs migrations and seeds these users (password `password`):

| Email               | State                                                       |
|---------------------|-------------------------------------------------------------|
| `admin@bigdogs.app` | Platform admin; owner of Acme Office                        |
| `alice@bigdogs.app` | Acme Office admin; also in Garage Gym                       |
| `bob@bigdogs.app`   | Acme Office member                                          |
| `carol@bigdogs.app` | Acme Office member; owner of Garage Gym                     |
| `dave@bigdogs.app`  | No org yet. Join with code `CLAIMDAVE` to claim player Dave |

Acme Office has six leaderboards (including a team board and an X of Y board),
plus an unclaimed player, Erin. Invite code `ACMEJOIN` joins Acme Office as a
member. The seeded TV display token is `local-display-token`.

## Common commands

```bash
pnpm dev:web              # Vite dev server
pnpm db:start | db:stop   # Local Supabase
pnpm db:status            # URLs + keys
pnpm db:reset             # Drop, re-run migrations, seed
pnpm db:migration <name>  # New migration file
pnpm db:types             # Regenerate packages/shared/src/types/database.ts

pnpm build                # Build shared + web
pnpm typecheck
pnpm lint
pnpm test                 # Shared package unit tests (Vitest)
pnpm test:e2e             # Playwright
```

## Local ports

BigDogs uses the **546xx** range to avoid clashing with other local Supabase
projects.

| Service        | Port  |
|----------------|-------|
| API (REST)     | 54621 |
| Postgres       | 54622 |
| Studio         | 54623 |
| Mailpit        | 54624 |
| Web dev server | 5180  |

## Platform admins

There's no UI for granting platform admin. In the Supabase SQL editor:

```sql
insert into public.platform_admins (user_id)
select id from public.profiles where email = '<email>';
```

## Branching & PRs

- Feature branches off `develop`; PR back into `develop`. Merging to `main`
  deploys (migrations → Supabase, web + marketing → Cloudflare Pages).
- Migrations go in `supabase/migrations/` as `YYYYMMDD_<name>.sql`. After adding
  one, run `pnpm db:reset` and `pnpm db:types`.
