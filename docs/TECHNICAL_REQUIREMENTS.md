# Technical Requirements

## Stack

| Layer          | Technology                                    |
|----------------|-----------------------------------------------|
| Frontend       | React 19, Vite 8, TypeScript                  |
| Styling        | Tailwind CSS v4, Radix UI primitives          |
| Routing        | React Router 7                                |
| Backend        | Supabase (PostgreSQL, Auth, Edge Functions)   |
| Edge Functions | Deno 2, layered manager pattern (SupaArch)    |
| Validation     | Zod (shared schemas)                          |
| Monorepo       | pnpm workspaces                               |
| Testing        | Vitest (unit), Playwright (e2e)               |

## Architecture (SupaArch Pattern)

```
BigDogs/
├── apps/
│   └── web/                        # Vite + React 19 + Tailwind v4 + React Router 7
├── packages/
│   └── shared/                     # Shared types, services, Supabase client, validation
├── supabase/
│   ├── config.toml
│   ├── migrations/                 # PostgreSQL migrations
│   ├── functions/                  # Deno Edge Functions (layered managers)
│   │   ├── _shared/               # Managers, accessors, engines, utilities
│   │   ├── entity-load/           # EntityManager.load()
│   │   ├── entity-store/          # EntityManager.store()
│   │   ├── entity-delete/         # EntityManager.delete()
│   │   ├── transaction-load/      # TransactionManager.load()
│   │   ├── transaction-execute/   # TransactionManager.execute()
│   │   ├── feed-schedule/         # FeedManager.schedule()
│   │   ├── feed-ingest/           # FeedManager.ingest()
│   │   ├── feed-digest/           # FeedManager.digest()
│   │   ├── notification-notify/   # NotificationManager.notify()
│   │   └── notification-send/     # NotificationManager.send()
│   └── seed.sql
└── docs/                           # Planning & documentation
```

See [SERVICE_ARCHITECTURE.md](SERVICE_ARCHITECTURE.md) for full details on
managers, accessors, engines, utilities, and request types.

## Mobile-Friendly Web App

This is a responsive web app, not a native mobile app. Design priorities:

- Touch-friendly input targets (48px minimum)
- Bottom-anchored primary actions (thumb zone)
- Single-column layouts on mobile viewports
- No hover-dependent interactions
- PWA capability considered for future (push notifications for weigh-in reminders)

## Authentication

- Email/password signup and login
- Supabase Auth with JWT
- RLS policies on all tables
- Session management via Supabase client

## Database

- PostgreSQL 17 via Supabase
- Row-Level Security (RLS) on all user-facing tables
- Auto-trigger for profile creation on signup
- Computed fields stored for weekly results (complex scoring formula)

## Edge Functions (Layered Pattern)

Following SupaArch's 4-layer interceptor pattern:

1. **Input Validation** — Zod schemas validate request payloads
2. **Mapper** — Translate request criteria to validation criteria
3. **Validation Engine** — Business logic (safety rails, permissions, state checks)
4. **Handlers** — Execute operations (CRUD, scoring computations)

## Development Workflow

```bash
pnpm install
pnpm db:start            # Supabase local via Docker
pnpm db:functions         # Edge Functions (terminal 2)
pnpm dev:web              # Vite dev server (terminal 3)
```

## Deployment

- Supabase hosted project (database, auth, edge functions, storage)
- Web hosting TBD (Cloudflare Pages, Vercel, or similar)
- CI/CD via GitHub Actions (TBD)
