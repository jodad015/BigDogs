# Deployment Setup

## Environments

| Environment | Branch    | Supabase         | Web Hosting | Trigger               |
|-------------|-----------|------------------|-------------|-----------------------|
| **Local**   | any       | Docker (546xx)   | Vite (5180) | Manual (`pnpm dev`)   |
| **Production** | `main` | Supabase Cloud   | Cloudflare Pages | Merge to `main`  |

## Branch Strategy

```
feature/* ──► develop ──► main (production)
```

- **`develop`** — Active development. PRs target here.
- **`main`** — Production. Only accepts merges from `develop`.
  Merging triggers the deploy workflow.
- **`feature/*`** — Feature branches off `develop`.

PR checks (lint, typecheck, test, build) run on all PRs to `main` or `develop`.

---

## Step 1: Create Supabase Cloud Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project (name: `bigdogs` or similar)
3. Note the following from **Settings > API**:
   - **Project URL** → `PROD_SUPABASE_URL`
   - **Anon public key** → `PROD_SUPABASE_ANON_KEY`
   - **Project ref** (from the URL: `https://supabase.com/dashboard/project/<ref>`) → `PROD_SUPABASE_PROJECT_REF`
4. From **Settings > Database**:
   - **Database password** → `PROD_SUPABASE_DB_PASSWORD`
5. Generate an access token at [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens):
   - → `SUPABASE_ACCESS_TOKEN`

### Configure Auth

In **Authentication > Providers**, enable:
- Email (enabled by default)
- Adjust site URL to your production domain

---

## Step 2: Set Up Cloudflare Pages

1. Create a Cloudflare account at [dash.cloudflare.com](https://dash.cloudflare.com)
2. Go to **Workers & Pages > Create > Pages**
3. Create project named `bigdogs` (choose "Direct Upload", not Git — CI handles deploys)
4. Get credentials:
   - **API Token** — go to Account > API Tokens > Create Token
     - Use the "Edit Cloudflare Pages" template
     - → `CLOUDFLARE_API_TOKEN`
   - **Account ID** — visible on the dashboard Overview page or in the URL
     - → `CLOUDFLARE_ACCOUNT_ID`
5. (Optional) Set up a custom domain under the Pages project settings

---

## Step 3: Configure GitHub Secrets

Go to repo **Settings > Secrets and variables > Actions** and add:

### Required Secrets

| Secret                       | Source                    | Description                    |
|------------------------------|---------------------------|--------------------------------|
| `PROD_SUPABASE_URL`         | Supabase dashboard        | Production API URL             |
| `PROD_SUPABASE_ANON_KEY`    | Supabase dashboard        | Production anon key            |
| `PROD_SUPABASE_PROJECT_REF` | Supabase dashboard URL    | Project reference ID           |
| `PROD_SUPABASE_DB_PASSWORD` | Supabase dashboard        | Database password              |
| `SUPABASE_ACCESS_TOKEN`     | Supabase account settings | CLI access token               |

### Cloudflare Secrets

| Secret                  | Source              | Description                    |
|-------------------------|---------------------|--------------------------------|
| `CLOUDFLARE_API_TOKEN`  | Cloudflare dashboard| API token with Pages edit perm |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard| Account identifier             |

---

## Step 4: Test the Pipeline

1. Create a feature branch off `develop`
2. Make a small change and open a PR to `develop`
3. Verify PR checks pass (lint, typecheck, test, build)
4. Merge to `develop`
5. Open a PR from `develop` to `main`
6. Merge to `main`
7. Verify the deploy workflow runs successfully
8. Check the production site and Supabase dashboard

---

## Database Migrations

Migrations are pushed automatically on deploy to production.

### Creating a new migration locally:

```bash
# Make schema changes in Supabase Studio (localhost:54623)
# Then generate a migration file:
pnpm db:migration my_migration_name

# Or write the migration manually in supabase/migrations/

# Reset local DB to verify:
pnpm db:reset
```

### Migration flow:

```
Local: Write migration → db:reset (test locally)
  ↓
PR: Migration file committed → PR checks validate
  ↓
Merge to main: supabase db push → applied to production
```

---

## Marketing Site

The marketing site (`apps/marketing/`) is a static HTML/CSS page deployed
separately from the web app.

| App | Domain | Cloudflare Pages Project | Source |
|-----|--------|--------------------------|--------|
| Marketing | bigdogs.app | `bigdogs-marketing` | `apps/marketing/dist/` |
| Web App | app.bigdogs.app | `bigdogs` | `apps/web/dist/` |

### Setup

1. In Cloudflare Dashboard → Pages → Create project:
   - **Project name:** `bigdogs-marketing`
   - Choose "Direct Upload" (CI handles deploys via Wrangler)
2. In the project → Custom domains → Add `bigdogs.app`
3. No new GitHub secrets needed — reuses existing `CLOUDFLARE_API_TOKEN`
   and `CLOUDFLARE_ACCOUNT_ID`

### Local Development

```bash
pnpm dev:marketing    # Serves on localhost:3001
pnpm dev              # Web app on localhost:5180
```

Marketing "Get Started" links point to `http://localhost:5180` in dev mode.

---

## What You Need To Do

- [x] Create Supabase cloud project and note credentials
- [ ] Create Cloudflare Pages project named `bigdogs` (web app)
- [ ] Create Cloudflare Pages project named `bigdogs-marketing` (marketing site)
- [ ] Add custom domain `bigdogs.app` to `bigdogs-marketing` project
- [ ] Add custom domain `app.bigdogs.app` to `bigdogs` project
- [ ] Create Cloudflare API token with Pages edit permission
- [ ] Add all 7 GitHub secrets to the repo (5 Supabase + 2 Cloudflare)
- [ ] Test the pipeline with a PR → merge cycle
