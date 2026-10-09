# One-time production reset (leaderboard pivot)

> **Done on 2026-10-09.** Production now runs the leaderboard schema, and new
> migrations deploy normally on merge to `main`. Kept for the record; don't run
> it again unless you mean to wipe production.

The pivot replaced every migration with a single baseline, so production has to
be wiped once. **Do this before merging the pivot into `main`.** Otherwise the
deploy's `supabase db push` fails because production's migration history lists
versions that no longer exist locally.

This deletes all production data and all user accounts.

Run the commands from the repo root on your own machine, **with the
`feature/leaderboard-pivot` branch (or a branch that contains it) checked
out**. `db reset --linked` applies whatever is in your local
`supabase/migrations/`. If the Supabase CLI isn't installed, prefix the
commands with `npx` (`npx supabase ...`).

Do steps 3–6 back to back. Between the reset and the deploy, the live web app
is still the old weight app running against the new schema, so it will be
broken.

1. **Log in and link the project.** Use the `SUPABASE_ACCESS_TOKEN` and
   `PROD_SUPABASE_PROJECT_REF` values from the dashboard (the same values as the
   GitHub secrets). `link` prompts for the database password
   (`PROD_SUPABASE_DB_PASSWORD`).

   ```bash
   supabase login
   supabase link --project-ref <PROD_PROJECT_REF>
   ```

2. **Delete the old edge functions** (the app no longer uses any)

   ```bash
   for f in entity-load entity-store entity-delete transaction-load transaction-execute \
            feed-schedule feed-ingest feed-digest notification-notify notification-send; do
     supabase functions delete "$f"
   done
   ```

3. **Reset the database to the new baseline, without seed data**

   ```bash
   supabase db reset --linked --no-seed
   ```

   `--no-seed` matters: the seed creates users whose password is `password`.

4. **Delete old accounts.** In the dashboard SQL editor:

   ```sql
   delete from auth.users;
   ```

5. **Sign up again** at the production app, then make yourself platform admin:

   ```sql
   insert into public.platform_admins (user_id)
   select id from public.profiles where email = '<your email>';
   ```

6. **Merge to `main`.** The deploy's `supabase db push` should report the
   database is up to date.
