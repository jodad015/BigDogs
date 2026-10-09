# Architecture

BigDogs is a Supabase app with no server code of its own. The React app reads
and writes Postgres through supabase-js. Row level security (RLS) decides what
each user can see and change, and a few SQL functions handle the operations
that need more than one table or must bypass RLS in a controlled way.

The schema starts from
[`supabase/migrations/20261009_baseline.sql`](../supabase/migrations/20261009_baseline.sql);
later migrations in the same folder change it in place:

| Migration                            | Change                                                        |
|--------------------------------------|---------------------------------------------------------------|
| `20261010_fix_last_owner_guard.sql`  | Last-owner guard runs as security definer so RLS can't hide the org from it |
| `20261011_display_team_avatars.sql`  | `get_display` returns an `id` and `avatars` array per standing |

## Data model

```
auth.users ─1:1─ profiles ─┬─ platform_admins
                           └─ org_members ── organizations
                                                 │
        ┌──────────────┬──────────────┬──────────┼──────────────┬───────────────┐
     players         teams       leaderboards  org_invites   display_links
        │              │              │
        └─ team_members┘              │
        │              │              │
        └──────────── entries ────────┘   (each entry: one player OR one team)
```

| Table             | Purpose                                                                 |
|-------------------|-------------------------------------------------------------------------|
| `profiles`        | One per auth user, created by a trigger on signup                       |
| `platform_admins` | Users who can create organizations. Granted by SQL only                  |
| `organizations`   | A tenant. Has a timezone used for "this week/month" windows             |
| `org_members`     | User ↔ org with role `owner`, `admin` or `member`. A user can be in many orgs |
| `players`         | A person on the boards. `user_id` is null until someone claims it       |
| `teams`           | A fixed roster of 2–10 players, reusable across boards                  |
| `leaderboards`    | Config for one game (see below)                                         |
| `entries`         | One logged result                                                       |
| `org_invites`     | Join codes. Can carry a role and a player to claim on join              |
| `display_links`   | Secret tokens for the read-only TV view                                 |

Every tenant table has an `org_id`. Children reference parents with composite
foreign keys on `(id, org_id)`, so the database itself rejects an entry for a
player in a different org.

## Leaderboard config

| Column             | Values                                                                     |
|--------------------|----------------------------------------------------------------------------|
| `metric_type`      | `duration`, `count`, `points`, `distance`, `weight`, `made_of_attempts`    |
| `unit`             | Label like `reps`, `ft`, `putts`. Durations are always `sec`               |
| `decimals`         | Display precision, 0–3                                                     |
| `default_attempts` | `made_of_attempts` only: pre-fills "out of" (e.g. 10)                      |
| `direction`        | `higher_better`, `lower_better` (X of Y is always higher)                  |
| `aggregation`      | `best`, `sum`, `average`, `latest`, `entry_count`                          |
| `default_window`   | `all_time`, `year`, `quarter`, `month`, `week`                             |
| `entrant_type`     | `player` or `team` (with `team_size`)                                      |
| `config`           | jsonb for future options that don't need their own column                 |

Once a board has entries, `metric_type`, `entrant_type` and `team_size` are
locked; the rest can change and standings recompute.

### Stored values

- `duration`: milliseconds.
- `made_of_attempts`: `value` = made, `attempts` = attempts. Ranked by ratio;
  equal ratios share a rank.
- Everything else: the number in the board's unit.

Formatting and input parsing live in
[`packages/shared/src/leaderboard/format.ts`](../packages/shared/src/leaderboard/format.ts).

### Standings

`leaderboard_standings(p_leaderboard_id, p_from?, p_to?, p_window?)` returns
`rank, player_id, team_id, score, made, attempts, entry_count, last_achieved_at`.
Pass `p_window => 'month'` to start at the current month in the org's timezone.
Ties share a rank (`rank()`), and for `best` the earliest entry wins ties within
a player. It runs as the caller, so RLS applies.

## Permissions

RLS policies call these `security definer` helpers rather than querying
`org_members` themselves (which would recurse):
`is_platform_admin()`, `is_org_member(org)`, `has_org_role(org, roles)`,
`shares_org_with(user)`, `is_entrant_user(player, team)`.

| Action                          | Who                                                       |
|---------------------------------|-----------------------------------------------------------|
| Create an organization          | Platform admin (`create_organization()`)                  |
| Edit org name/timezone          | Org owner or admin                                        |
| Change member roles             | Org owner. The last owner can't leave or be demoted       |
| Remove a member                 | Owner (anyone), admin (members only), or yourself         |
| Create invites                  | Members (member role), admins (admin), owners (owner)     |
| Add players                     | Any member                                                |
| Rename a player                 | Its user, its creator, or an admin                        |
| Claim a player                  | Any member, once, via `claim_player()` or an invite       |
| Create teams                    | Any member (`find_or_create_team()`)                      |
| Create leaderboards             | Any member                                                |
| Edit/delete a leaderboard       | Its creator or an admin                                   |
| Log an entry                    | Any member, for any player or team in the org             |
| Edit/delete an entry            | Who logged it, the player (or a team member), or an admin |
| Manage display links            | Owner or admin                                            |
| View the TV display             | Anyone with the token (`get_display()`)                   |

## RPC functions

| Function                                  | Notes                                                  |
|-------------------------------------------|--------------------------------------------------------|
| `create_organization(name, slug, tz)`     | Platform admin; caller becomes owner                   |
| `get_invite(code)`                        | Preview an invite before accepting                     |
| `accept_invite(code)`                     | Join (or upgrade role); claims the invite's player     |
| `claim_player(player_id)`                 | Link an unclaimed player to yourself                   |
| `ensure_my_player(org_id)`                | Your player in an org, created from your profile if needed |
| `find_or_create_team(org_id, player_ids)` | Teams are identified by exact roster                   |
| `leaderboard_standings(...)`              | See above                                              |
| `get_display(token)`                      | All boards + standings for the TV view, as JSON        |

## TV display

`display_links.token` is a 64-character secret. `get_display()` is callable by
the `anon` role, checks the token, and returns every non-archived board with
standings for its default window. Deleting the row revokes the link. The TV
page polls this function, since anonymous users can't subscribe to Realtime
on RLS-protected tables.

Signed-in clients can subscribe to `entries` through Supabase Realtime for
live updates.

The web page lives at `/tv/:token` (no sign-in). It polls every 15 seconds,
rotates boards every 12 seconds, and shows a "took #1" banner (jumping to that
board) when a board's leader changes between polls. It requests a screen wake
lock so tablets stay on. Query options: `?board=<id>` pins one board,
`?interval=<seconds>` changes rotation speed. Admins create and revoke links
under Settings → TV displays.

## Web app

React 19 + React Router. Pages read and write through supabase-js hooks in
`apps/web/src/hooks/`; there is no API layer in between.

| Route                         | Page                     | Notes                                           |
|-------------------------------|--------------------------|-------------------------------------------------|
| `/login`, `/signup`           | `pages/login`, `signup`  | Carry `?next=` so invite links survive sign-in  |
| `/`                           | `pages/org-index`        | Redirects to a saved `next`, last org, or `/orgs` |
| `/orgs`                       | `pages/orgs`             | Your orgs, join by code, create (platform admin) |
| `/join/:code`                 | `pages/join`             | Invite preview, accept, then claim a player     |
| `/o/:slug`                    | `pages/org/boards`       | Board cards with top 3                          |
| `/o/:slug/new`                | `pages/org/new-board`    | Templates, then `LeaderboardForm`               |
| `/o/:slug/b/:id`              | `pages/org/board`        | Standings, time windows, recent scores, realtime |
| `/o/:slug/b/:id/log`          | `pages/org/log-entry`    | Log a score; `?entry=` edits one                |
| `/o/:slug/b/:id/edit`         | `pages/org/edit-board`   | Creator or admin; archive/delete                |
| `/o/:slug/people`             | `pages/org/people`       | Players, Teams, Members tabs (`?tab=`)          |
| `/o/:slug/invites`            | `pages/org/invites`      | Create/revoke invite links                      |
| `/o/:slug/settings`           | `pages/org/settings`     | Org details, TV displays (admins), leave        |
| `/tv/:token`                  | `pages/tv`               | Public, no auth                                 |

Supporting pieces:

- `lib/orgs.tsx` loads the user's orgs once (`OrgsProvider`); `OrgLayout`
  resolves `:slug` and provides `useCurrentOrg()` (role, `isAdmin`).
- `hooks/use-supabase-query.ts` is the small fetch helper every data hook uses.
- `hooks/use-competitors.ts` turns a player or team id into a name and avatars.
- `components/ui.tsx` holds the shared button/input classes and small
  components; pages use Tailwind directly otherwise.
- Formatting and parsing of scores (stopwatch input, X of Y, rules text) live
  in `packages/shared/src/leaderboard/` with unit tests.

## Testing

- `pnpm test`: Vitest unit tests for the shared package (formatting, parsing).
- `pnpm test:e2e`: Playwright against the local stack and dev server. Specs in
  `apps/web/e2e/` cover orgs/invites, boards, teams and TV mode. They change
  seed data, so run `pnpm db:reset` first; files run one at a time because they
  share the database. Not yet wired into CI.
- RLS changes: impersonate a seed user in SQL to check them, e.g.
  `set local role authenticated; select set_config('request.jwt.claims', '{"sub":"<user id>"}', true);`
  inside a transaction.

