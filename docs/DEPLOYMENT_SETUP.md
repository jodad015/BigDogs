# Deployment Setup

## Environments

| Environment | Branch    | Supabase         | Web Hosting | Trigger               |
|-------------|-----------|------------------|-------------|-----------------------|
| **Local**   | any       | Docker (546xx)   | Vite (5173) | Manual (`pnpm dev`)   |
| **Production** | `main` | Supabase Cloud   | TBD         | Merge to `main`       |

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

## Step 2: Choose Web Hosting

The deploy workflow has three options commented out. Pick one:

### Option A: Cloudflare Pages (Recommended)

1. Create a Cloudflare account at [dash.cloudflare.com](https://dash.cloudflare.com)
2. Go to **Workers & Pages > Create > Pages**
3. Create project `bigdogs` (direct upload, not Git integration — CI handles deploy)
4. Get credentials:
   - **API Token** (create at Account > API Tokens with "Edit Cloudflare Pages" permission) → `CLOUDFLARE_API_TOKEN`
   - **Account ID** (from the dashboard URL or Overview page) → `CLOUDFLARE_ACCOUNT_ID`
5. Uncomment "Option A" in `.github/workflows/on-merge-main.yml`

### Option B: GitHub Pages

1. Go to repo **Settings > Pages**
2. Set source to "GitHub Actions"
3. Add `pages: write` and `id-token: write` to the workflow permissions
4. Uncomment "Option B" in `.github/workflows/on-merge-main.yml`

### Option C: Vercel

1. Create project at [vercel.com](https://vercel.com)
2. Get credentials:
   - `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
3. Uncomment "Option C" in `.github/workflows/on-merge-main.yml`

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

### Hosting Secrets (depends on choice)

**Cloudflare Pages:**
| Secret                  | Source              |
|-------------------------|---------------------|
| `CLOUDFLARE_API_TOKEN`  | Cloudflare dashboard|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard|

**Vercel:**
| Secret              | Source           |
|---------------------|------------------|
| `VERCEL_TOKEN`      | Vercel dashboard |
| `VERCEL_ORG_ID`     | Vercel dashboard |
| `VERCEL_PROJECT_ID` | Vercel dashboard |

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

## Edge Functions

All 10 edge functions are deployed together on merge to main via
`supabase functions deploy`. Individual function deployment is also possible:

```bash
supabase functions deploy entity-load --import-map supabase/functions/import_map.json
```

---

## What You Need To Do

- [ ] Create Supabase cloud project and note credentials
- [ ] Choose a web hosting provider and set it up
- [ ] Add all required GitHub secrets to the repo
- [ ] Uncomment the chosen hosting option in the deploy workflow
- [ ] Test the pipeline with a PR → merge cycle
