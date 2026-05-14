# Local Development Setup

## Prerequisites

| Tool       | Version | Install                                    |
|------------|---------|---------------------------------------------|
| Node.js    | >= 22   | [nodejs.org](https://nodejs.org)            |
| pnpm       | >= 10   | `corepack enable && corepack prepare pnpm@latest --activate` |
| Docker     | latest  | [docker.com](https://docker.com)            |
| Supabase CLI | latest | `brew install supabase/tap/supabase`       |
| Deno       | >= 2    | `brew install deno` (for function tests)    |

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/jodad015/BigDogs.git
cd BigDogs

# 2. Install dependencies
pnpm install

# 3. Start Supabase (Docker must be running)
pnpm db:start

# 4. Copy the anon key from the output and update .env.local
#    Look for "anon key:" in the supabase start output
#    Update VITE_SUPABASE_ANON_KEY in .env.local

# 5. Start edge functions (new terminal)
pnpm db:functions

# 6. Start the web dev server (new terminal)
pnpm dev:web

# 7. Open http://localhost:5173
```

## VS Code Tasks (Recommended)

Open the command palette (`Cmd+Shift+P`) and run **Tasks: Run Task**, then pick:

| Task           | What it does                                          |
|----------------|-------------------------------------------------------|
| **Start All**  | Starts Supabase + Edge Functions + Web App            |
| **Start Web**  | Starts Supabase + Edge Functions + Web App            |
| **Start Backend** | Starts Supabase + Edge Functions only              |
| **Stop All**   | Stops Supabase containers                             |
| **Restart All**| Stops then starts Supabase                            |

All tasks run in the same terminal group ("dev") for easy monitoring.

## Environment Variables

The `.env.local` file at the project root holds local dev credentials:

```
VITE_SUPABASE_URL=http://127.0.0.1:54621
VITE_SUPABASE_ANON_KEY=<your-local-anon-key>
```

Get your anon key by running `pnpm db:status` after Supabase is started.

## Port Assignments

BigDogs uses the **546xx** port range to avoid conflicts with other local
Supabase projects (e.g., SupaArch on 545xx).

| Service          | Port  |
|------------------|-------|
| API (PostgREST)  | 54621 |
| Database (Postgres) | 54622 |
| Studio           | 54623 |
| Inbucket (email) | 54624 |
| Analytics        | 54627 |
| Edge Runtime Inspector | 8086 |
| Web Dev Server   | 5173  |

## Common Commands

```bash
# Development
pnpm dev:web              # Start Vite dev server
pnpm db:start             # Start local Supabase
pnpm db:stop              # Stop local Supabase
pnpm db:functions         # Serve edge functions locally
pnpm db:status            # Show Supabase status + keys

# Building
pnpm build:shared         # Compile shared package
pnpm build:web            # Build web app for production
pnpm build                # Build shared + web (in order)

# Database
pnpm db:reset             # Reset DB (runs migrations + seed)
pnpm db:migration <name>  # Create a new migration file
pnpm db:types             # Generate TypeScript types from schema

# Testing
pnpm test                 # Run shared package unit tests (Vitest)
pnpm test:functions       # Run edge function tests (Deno)
pnpm test:e2e             # Run web E2E tests (Playwright)
pnpm test:all             # Run all tests

# Code Quality
pnpm lint                 # Lint all packages
pnpm lint:fix             # Lint and auto-fix
pnpm format               # Format all files (Prettier)
pnpm format:check         # Check formatting
pnpm typecheck            # Type-check all packages
```

## Project Structure

```
BigDogs/
├── apps/
│   └── web/                        # React web app (Vite + Tailwind)
│       └── src/
│           ├── components/layout/  # App shell, routing guards
│           ├── lib/                # Supabase client, auth context
│           ├── pages/              # Route-level page components
│           └── ui/                 # Radix-based UI primitives
├── packages/
│   └── shared/                     # Shared types, services, validation
│       └── src/
│           ├── types/entity/       # Entity request types + interfaces
│           ├── types/transaction/  # Transaction request types + interfaces
│           ├── supabase/           # Supabase client factory
│           ├── services/           # Auth service
│           └── validation/         # Zod schemas
├── supabase/
│   ├── config.toml                 # Local Supabase config (546xx ports)
│   ├── migrations/                 # PostgreSQL migrations
│   ├── seed.sql                    # Local dev seed data
│   └── functions/
│       ├── _shared/                # Managers, accessors, engines, utilities
│       ├── entity-{load,store,delete}/
│       ├── transaction-{load,execute}/
│       ├── feed-{schedule,ingest,digest}/
│       └── notification-{notify,send}/
├── docs/                           # Planning documentation
└── .vscode/tasks.json              # VS Code task runner config
```

## Troubleshooting

**Supabase won't start**
- Make sure Docker is running
- Check if another project is using the same ports: `lsof -i :54621`
- Try `supabase stop --no-backup` then `supabase start`

**Edge functions not responding**
- Make sure functions are being served: `pnpm db:functions`
- Check the terminal for Deno errors
- Verify the import map: `supabase/functions/import_map.json`

**Web app can't connect to Supabase**
- Check `.env.local` has the correct URL and anon key
- Run `pnpm db:status` to get the current keys
- Make sure the URL uses `127.0.0.1`, not `localhost` (some systems differ)
