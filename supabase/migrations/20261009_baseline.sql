-- BigDogs baseline schema
-- Multi-org office-game leaderboards: organizations, members, players, teams,
-- config-driven leaderboards, entries, and read-only TV display links.
--
-- Conventions
--   * Every tenant table carries org_id. Composite foreign keys (id, org_id)
--     keep children in the same org as their parents.
--   * RLS policies call the security definer helpers below instead of querying
--     org_members directly, which avoids policy recursion.
--   * Entry values are stored in a base unit: milliseconds for durations, the
--     leaderboard's unit for everything else. made_of_attempts stores made in
--     value and the attempt count in attempts.

-- ============================================================
-- SHARED
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- PROFILES
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null check (char_length(display_name) between 1 and 50),
  avatar text not null default 'crimson',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile on signup. Google puts the name under full_name/name.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    left(coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Player'
    ), 50)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- PLATFORM ADMINS
-- Granted manually via SQL; there is no write policy.
-- ============================================================

create table public.platform_admins (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ORGANIZATIONS
-- ============================================================

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 40),
  timezone text not null default 'America/Chicago',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create table public.org_members (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create index org_members_user_id_idx on public.org_members(user_id);

-- ============================================================
-- PLAYERS
-- A player is a person on the boards. user_id is null until someone claims it.
-- ============================================================

create table public.players (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 50),
  avatar text not null default 'crimson',
  user_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, org_id),
  unique (org_id, user_id)
);

create unique index players_org_name_idx on public.players(org_id, lower(display_name));

create trigger players_set_updated_at
  before update on public.players
  for each row execute function public.set_updated_at();

-- ============================================================
-- TEAMS
-- Org-scoped so a roster can be reused across leaderboards. Rosters are fixed
-- once created; use find_or_create_team() to get one.
-- ============================================================

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text check (name is null or char_length(name) between 1 and 50),
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  unique (id, org_id)
);

create table public.team_members (
  team_id uuid not null,
  player_id uuid not null,
  org_id uuid not null,
  primary key (team_id, player_id),
  foreign key (team_id, org_id) references public.teams(id, org_id) on delete cascade,
  foreign key (player_id, org_id) references public.players(id, org_id) on delete cascade
);

create index team_members_player_id_idx on public.team_members(player_id);

-- ============================================================
-- LEADERBOARDS
-- ============================================================

create table public.leaderboards (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  description text check (description is null or char_length(description) <= 500),
  icon text not null default '🏆',

  -- What is measured
  metric_type text not null check (metric_type in ('duration', 'count', 'points', 'distance', 'weight', 'made_of_attempts')),
  unit text not null check (char_length(unit) between 1 and 20),
  decimals smallint not null default 0 check (decimals between 0 and 3),
  -- made_of_attempts only: pre-fill attempts (e.g. always out of 10)
  default_attempts int check (default_attempts is null or default_attempts > 0),

  -- How it ranks
  direction text not null check (direction in ('higher_better', 'lower_better')),
  aggregation text not null check (aggregation in ('best', 'sum', 'average', 'latest', 'entry_count')),
  default_window text not null default 'all_time' check (default_window in ('all_time', 'year', 'quarter', 'month', 'week')),

  -- Who competes
  entrant_type text not null default 'player' check (entrant_type in ('player', 'team')),
  team_size smallint check (team_size is null or team_size between 2 and 10),

  config jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,

  unique (id, org_id),
  check ((entrant_type = 'team') = (team_size is not null)),
  check (metric_type <> 'made_of_attempts' or direction = 'higher_better'),
  check (metric_type = 'made_of_attempts' or default_attempts is null)
);

create index leaderboards_org_id_idx on public.leaderboards(org_id);

create trigger leaderboards_set_updated_at
  before update on public.leaderboards
  for each row execute function public.set_updated_at();

-- ============================================================
-- ENTRIES
-- ============================================================

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  leaderboard_id uuid not null,
  org_id uuid not null,
  player_id uuid,
  team_id uuid,
  value numeric not null check (value >= 0),
  attempts numeric check (attempts is null or attempts > 0),
  achieved_at timestamptz not null default now(),
  note text check (note is null or char_length(note) <= 280),
  recorded_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  check (num_nonnulls(player_id, team_id) = 1),
  check (attempts is null or value <= attempts),
  foreign key (leaderboard_id, org_id) references public.leaderboards(id, org_id) on delete cascade,
  foreign key (player_id, org_id) references public.players(id, org_id) on delete cascade,
  foreign key (team_id, org_id) references public.teams(id, org_id) on delete cascade
);

create index entries_leaderboard_achieved_idx on public.entries(leaderboard_id, achieved_at);
create index entries_player_id_idx on public.entries(player_id) where player_id is not null;
create index entries_team_id_idx on public.entries(team_id) where team_id is not null;

-- ============================================================
-- INVITES & DISPLAY LINKS
-- ============================================================

create table public.org_invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  -- Optional: accepting this invite also claims this player
  player_id uuid,
  max_uses int check (max_uses is null or max_uses > 0),
  use_count int not null default 0,
  expires_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (player_id, org_id) references public.players(id, org_id) on delete cascade
);

create index org_invites_org_id_idx on public.org_invites(org_id);

-- Read-only links for the office TV/tablet. Anyone holding the token can view
-- the org's boards through get_display(); deleting the row revokes it.
create table public.display_links (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null default 'Office display' check (char_length(name) between 1 and 50),
  token text not null unique default replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create index display_links_org_id_idx on public.display_links(org_id);

-- ============================================================
-- RLS HELPERS
-- ============================================================

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.platform_admins where user_id = auth.uid());
$$;

create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.org_members where org_id = p_org_id and user_id = auth.uid()
  );
$$;

create or replace function public.has_org_role(p_org_id uuid, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.org_members
    where org_id = p_org_id and user_id = auth.uid() and role = any(p_roles)
  );
$$;

create or replace function public.shares_org_with(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.org_members mine
    join public.org_members theirs on theirs.org_id = mine.org_id
    where mine.user_id = auth.uid() and theirs.user_id = p_user_id
  );
$$;

-- True when the caller is the claimed user of the player, or of any member of the team.
create or replace function public.is_entrant_user(p_player_id uuid, p_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.players p
    where p.user_id = auth.uid()
      and (
        p.id = p_player_id
        or p.id in (select tm.player_id from public.team_members tm where tm.team_id = p_team_id)
      )
  );
$$;

-- ============================================================
-- INTEGRITY TRIGGERS
-- ============================================================

-- An org must always keep at least one owner. Skipped when the org or the
-- user's profile is being deleted (cascades).
create or replace function public.guard_last_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.role <> 'owner' then
    return null;
  end if;
  if tg_op = 'UPDATE' and new.role = 'owner' then
    return null;
  end if;
  if not exists (select 1 from public.organizations where id = old.org_id) then
    return null;
  end if;
  if not exists (select 1 from public.profiles where id = old.user_id) then
    return null;
  end if;
  if not exists (
    select 1 from public.org_members
    where org_id = old.org_id and role = 'owner' and user_id <> old.user_id
  ) then
    raise exception 'An organization must have at least one owner';
  end if;
  return null;
end;
$$;

create trigger org_members_guard_last_owner
  after update or delete on public.org_members
  for each row execute function public.guard_last_owner();

-- Claiming goes through claim_player()/accept_invite(). Direct updates may only
-- unlink (set null), and only by the linked user or an org admin.
create or replace function public.guard_player_user()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id is not distinct from old.user_id then
    return new;
  end if;
  -- Service role / migrations / seed have no auth.uid()
  if auth.uid() is null then
    return new;
  end if;
  if new.user_id is null then
    if old.user_id = auth.uid() or public.has_org_role(old.org_id, array['owner', 'admin']) then
      return new;
    end if;
    raise exception 'Only the linked user or an org admin can unlink a player';
  end if;
  if old.user_id is null and new.user_id = auth.uid() then
    return new;
  end if;
  raise exception 'Players can only be claimed by the signed-in user';
end;
$$;

create trigger players_guard_user
  before update on public.players
  for each row execute function public.guard_player_user();

-- Entries must match their leaderboard's entrant type, team size and metric.
create or replace function public.validate_entry()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_lb public.leaderboards%rowtype;
  v_team_size int;
begin
  select * into v_lb from public.leaderboards where id = new.leaderboard_id;

  if v_lb.archived_at is not null then
    raise exception 'This leaderboard is archived';
  end if;

  if v_lb.entrant_type = 'player' and new.player_id is null then
    raise exception 'This leaderboard takes player entries';
  end if;

  if v_lb.entrant_type = 'team' then
    if new.team_id is null then
      raise exception 'This leaderboard takes team entries';
    end if;
    select count(*) into v_team_size from public.team_members where team_id = new.team_id;
    if v_team_size <> v_lb.team_size then
      raise exception 'Teams on this leaderboard must have % players', v_lb.team_size;
    end if;
  end if;

  if v_lb.metric_type = 'made_of_attempts' then
    if new.attempts is null then
      raise exception 'Attempts are required for this leaderboard';
    end if;
    if new.value <> trunc(new.value) or new.attempts <> trunc(new.attempts) then
      raise exception 'Made and attempts must be whole numbers';
    end if;
  elsif new.attempts is not null then
    raise exception 'Attempts only apply to made-of-attempts leaderboards';
  end if;

  if v_lb.metric_type = 'count' and new.value <> trunc(new.value) then
    raise exception 'Counts must be whole numbers';
  end if;

  return new;
end;
$$;

create trigger entries_validate
  before insert or update on public.entries
  for each row execute function public.validate_entry();

-- Once a leaderboard has entries, changing what it measures would corrupt them.
create or replace function public.guard_leaderboard_shape()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (new.metric_type, new.entrant_type, new.team_size)
       is distinct from (old.metric_type, old.entrant_type, old.team_size)
     and exists (select 1 from public.entries where leaderboard_id = old.id) then
    raise exception 'Metric and entrant settings cannot change once a leaderboard has entries';
  end if;
  return new;
end;
$$;

create trigger leaderboards_guard_shape
  before update on public.leaderboards
  for each row execute function public.guard_leaderboard_shape();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.platform_admins enable row level security;
alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.players enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.leaderboards enable row level security;
alter table public.entries enable row level security;
alter table public.org_invites enable row level security;
alter table public.display_links enable row level security;

-- profiles
create policy "Read own and co-member profiles"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.shares_org_with(id) or public.is_platform_admin());

create policy "Update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- platform_admins
create policy "Read own platform admin row"
  on public.platform_admins for select to authenticated
  using (user_id = auth.uid());

-- organizations (created via create_organization())
create policy "Members read their orgs"
  on public.organizations for select to authenticated
  using (public.is_org_member(id) or public.is_platform_admin());

create policy "Owners and admins update org"
  on public.organizations for update to authenticated
  using (public.has_org_role(id, array['owner', 'admin']) or public.is_platform_admin())
  with check (public.has_org_role(id, array['owner', 'admin']) or public.is_platform_admin());

create policy "Platform admins delete orgs"
  on public.organizations for delete to authenticated
  using (public.is_platform_admin());

-- org_members (joining goes through accept_invite())
create policy "Members read org membership"
  on public.org_members for select to authenticated
  using (public.is_org_member(org_id) or public.is_platform_admin());

create policy "Owners add members"
  on public.org_members for insert to authenticated
  with check (public.has_org_role(org_id, array['owner']) or public.is_platform_admin());

create policy "Owners change roles"
  on public.org_members for update to authenticated
  using (public.has_org_role(org_id, array['owner']) or public.is_platform_admin())
  with check (public.has_org_role(org_id, array['owner']) or public.is_platform_admin());

create policy "Leave, or remove members"
  on public.org_members for delete to authenticated
  using (
    user_id = auth.uid()
    or public.is_platform_admin()
    or public.has_org_role(org_id, array['owner'])
    or (role = 'member' and public.has_org_role(org_id, array['admin']))
  );

-- players
create policy "Members read players"
  on public.players for select to authenticated
  using (public.is_org_member(org_id));

create policy "Members add players"
  on public.players for insert to authenticated
  with check (
    public.is_org_member(org_id)
    and created_by = auth.uid()
    and (user_id is null or user_id = auth.uid())
  );

create policy "Edit own, created, or as admin"
  on public.players for update to authenticated
  using (
    public.is_org_member(org_id)
    and (user_id = auth.uid() or created_by = auth.uid() or public.has_org_role(org_id, array['owner', 'admin']))
  )
  with check (public.is_org_member(org_id));

create policy "Admins delete players"
  on public.players for delete to authenticated
  using (public.has_org_role(org_id, array['owner', 'admin']));

-- teams (created via find_or_create_team())
create policy "Members read teams"
  on public.teams for select to authenticated
  using (public.is_org_member(org_id));

create policy "Members rename teams"
  on public.teams for update to authenticated
  using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));

create policy "Admins delete teams"
  on public.teams for delete to authenticated
  using (public.has_org_role(org_id, array['owner', 'admin']));

create policy "Members read team members"
  on public.team_members for select to authenticated
  using (public.is_org_member(org_id));

-- leaderboards (any member can create)
create policy "Members read leaderboards"
  on public.leaderboards for select to authenticated
  using (public.is_org_member(org_id));

create policy "Members create leaderboards"
  on public.leaderboards for insert to authenticated
  with check (public.is_org_member(org_id) and created_by = auth.uid());

create policy "Creator or admin edits leaderboard"
  on public.leaderboards for update to authenticated
  using (created_by = auth.uid() or public.has_org_role(org_id, array['owner', 'admin']))
  with check (public.is_org_member(org_id));

create policy "Creator or admin deletes leaderboard"
  on public.leaderboards for delete to authenticated
  using (created_by = auth.uid() or public.has_org_role(org_id, array['owner', 'admin']));

-- entries (any member can log for anyone in the org)
create policy "Members read entries"
  on public.entries for select to authenticated
  using (public.is_org_member(org_id));

create policy "Members log entries"
  on public.entries for insert to authenticated
  with check (public.is_org_member(org_id) and recorded_by = auth.uid());

create policy "Recorder, entrant, or admin edits entry"
  on public.entries for update to authenticated
  using (
    public.is_org_member(org_id)
    and (
      recorded_by = auth.uid()
      or public.is_entrant_user(player_id, team_id)
      or public.has_org_role(org_id, array['owner', 'admin'])
    )
  )
  with check (public.is_org_member(org_id));

create policy "Recorder, entrant, or admin deletes entry"
  on public.entries for delete to authenticated
  using (
    public.is_org_member(org_id)
    and (
      recorded_by = auth.uid()
      or public.is_entrant_user(player_id, team_id)
      or public.has_org_role(org_id, array['owner', 'admin'])
    )
  );

-- org_invites: members invite members, admins invite admins, owners invite owners
create policy "Members read invites"
  on public.org_invites for select to authenticated
  using (public.is_org_member(org_id));

create policy "Create invites up to own role"
  on public.org_invites for insert to authenticated
  with check (
    created_by = auth.uid()
    and (
      (role = 'member' and public.is_org_member(org_id))
      or (role = 'admin' and public.has_org_role(org_id, array['owner', 'admin']))
      or (role = 'owner' and public.has_org_role(org_id, array['owner']))
      or public.is_platform_admin()
    )
  );

create policy "Creator or admin revokes invite"
  on public.org_invites for delete to authenticated
  using (created_by = auth.uid() or public.has_org_role(org_id, array['owner', 'admin']));

-- display_links: admins only
create policy "Admins manage display links"
  on public.display_links for all to authenticated
  using (public.has_org_role(org_id, array['owner', 'admin']))
  with check (public.has_org_role(org_id, array['owner', 'admin']));

-- ============================================================
-- RPCs
-- ============================================================

create or replace function public.create_organization(p_name text, p_slug text, p_timezone text default 'America/Chicago')
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org_id uuid;
begin
  if not public.is_platform_admin() then
    raise exception 'Only platform admins can create organizations';
  end if;

  insert into public.organizations (name, slug, timezone, created_by)
  values (p_name, p_slug, p_timezone, auth.uid())
  returning id into v_org_id;

  insert into public.org_members (org_id, user_id, role)
  values (v_org_id, auth.uid(), 'owner');

  return v_org_id;
end;
$$;

-- Preview an invite before accepting (org name, role, player to be claimed).
create or replace function public.get_invite(p_code text)
returns table (org_id uuid, org_name text, role text, player_name text, is_valid boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select
    o.id,
    o.name,
    i.role,
    p.display_name,
    (i.expires_at is null or i.expires_at > now())
      and (i.max_uses is null or i.use_count < i.max_uses)
      and (p.id is null or p.user_id is null)
  from public.org_invites i
  join public.organizations o on o.id = i.org_id
  left join public.players p on p.id = i.player_id
  where i.code = upper(trim(p_code));
$$;

-- Join an org from an invite code. Claims the invite's player if it has one.
-- Already a member? Upgrades the role if the invite grants a higher one.
create or replace function public.accept_invite(p_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invite public.org_invites%rowtype;
  v_existing_role text;
begin
  if auth.uid() is null then
    raise exception 'Sign in to accept an invite';
  end if;

  select * into v_invite from public.org_invites where code = upper(trim(p_code)) for update;
  if not found then
    raise exception 'Invite not found';
  end if;
  if v_invite.expires_at is not null and v_invite.expires_at <= now() then
    raise exception 'This invite has expired';
  end if;
  if v_invite.max_uses is not null and v_invite.use_count >= v_invite.max_uses then
    raise exception 'This invite has been used up';
  end if;

  select role into v_existing_role
  from public.org_members
  where org_id = v_invite.org_id and user_id = auth.uid();

  if v_existing_role is null then
    insert into public.org_members (org_id, user_id, role)
    values (v_invite.org_id, auth.uid(), v_invite.role);
  elsif array_position(array['member', 'admin', 'owner'], v_invite.role)
        > array_position(array['member', 'admin', 'owner'], v_existing_role) then
    update public.org_members set role = v_invite.role
    where org_id = v_invite.org_id and user_id = auth.uid();
  end if;

  if v_invite.player_id is not null then
    perform public.claim_player(v_invite.player_id);
  end if;

  update public.org_invites set use_count = use_count + 1 where id = v_invite.id;

  return v_invite.org_id;
end;
$$;

-- Link an unclaimed player to the caller. One player per user per org.
create or replace function public.claim_player(p_player_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_player public.players%rowtype;
begin
  select * into v_player from public.players where id = p_player_id for update;
  if not found then
    raise exception 'Player not found';
  end if;
  if not public.is_org_member(v_player.org_id) then
    raise exception 'Join the organization before claiming a player';
  end if;
  if v_player.user_id = auth.uid() then
    return;
  end if;
  if v_player.user_id is not null then
    raise exception 'This player has already been claimed';
  end if;
  if exists (select 1 from public.players where org_id = v_player.org_id and user_id = auth.uid()) then
    raise exception 'You already have a player in this organization';
  end if;

  update public.players set user_id = auth.uid() where id = p_player_id;
end;
$$;

-- Return the caller's player in an org, creating one from their profile if needed.
create or replace function public.ensure_my_player(p_org_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_player_id uuid;
  v_profile public.profiles%rowtype;
  v_name text;
  v_suffix int := 1;
begin
  if not public.is_org_member(p_org_id) then
    raise exception 'Not a member of this organization';
  end if;

  select id into v_player_id from public.players where org_id = p_org_id and user_id = auth.uid();
  if v_player_id is not null then
    return v_player_id;
  end if;

  select * into v_profile from public.profiles where id = auth.uid();
  v_name := v_profile.display_name;
  -- Avoid colliding with an existing (unclaimed) player of the same name
  while exists (select 1 from public.players where org_id = p_org_id and lower(display_name) = lower(v_name)) loop
    v_suffix := v_suffix + 1;
    v_name := left(v_profile.display_name, 46) || ' ' || v_suffix;
  end loop;

  insert into public.players (org_id, display_name, avatar, user_id, created_by)
  values (p_org_id, v_name, v_profile.avatar, auth.uid(), auth.uid())
  returning id into v_player_id;

  return v_player_id;
end;
$$;

-- Teams are identified by their exact roster. Returns the existing team for
-- this set of players, or creates it.
create or replace function public.find_or_create_team(p_org_id uuid, p_player_ids uuid[], p_name text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ids uuid[];
  v_team_id uuid;
begin
  if not public.is_org_member(p_org_id) then
    raise exception 'Not a member of this organization';
  end if;

  select array_agg(distinct x order by x) into v_ids from unnest(p_player_ids) x;
  if coalesce(array_length(v_ids, 1), 0) < 2 then
    raise exception 'A team needs at least two different players';
  end if;
  if (select count(*) from public.players where org_id = p_org_id and id = any(v_ids)) <> array_length(v_ids, 1) then
    raise exception 'All team players must belong to this organization';
  end if;

  select t.id into v_team_id
  from public.teams t
  where t.org_id = p_org_id
    and (select array_agg(tm.player_id order by tm.player_id) from public.team_members tm where tm.team_id = t.id) = v_ids
  limit 1;

  if v_team_id is not null then
    if p_name is not null then
      update public.teams set name = p_name where id = v_team_id and name is null;
    end if;
    return v_team_id;
  end if;

  insert into public.teams (org_id, name, created_by)
  values (p_org_id, nullif(trim(p_name), ''), auth.uid())
  returning id into v_team_id;

  insert into public.team_members (team_id, player_id, org_id)
  select v_team_id, unnest(v_ids), p_org_id;

  return v_team_id;
end;
$$;

-- Start of a time window in the org's timezone (null = all time).
create or replace function public.window_start(p_window text, p_timezone text, p_at timestamptz default now())
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select case p_window
    when 'all_time' then null
    else date_trunc(p_window, p_at at time zone p_timezone) at time zone p_timezone
  end;
$$;

-- Ranked standings for a leaderboard over [p_from, p_to). Pass p_window
-- ('week', 'month', ...) instead of p_from to start at the current window in
-- the org's timezone. Runs with the caller's permissions, so RLS limits it to
-- the caller's orgs.
--   score: the ranking value. For made_of_attempts it is a 0-1 ratio.
--   made / attempts: the numbers behind a made_of_attempts score.
create or replace function public.leaderboard_standings(
  p_leaderboard_id uuid,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_window text default null
)
returns table (
  rank bigint,
  player_id uuid,
  team_id uuid,
  score numeric,
  made numeric,
  attempts numeric,
  entry_count bigint,
  last_achieved_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  with lb as (
    select
      l.metric_type,
      l.aggregation,
      case when l.aggregation = 'entry_count' then 'higher_better' else l.direction end as direction,
      coalesce(p_from, public.window_start(coalesce(p_window, 'all_time'), o.timezone)) as from_at
    from public.leaderboards l
    join public.organizations o on o.id = l.org_id
    where l.id = p_leaderboard_id
  ),
  e as (
    select
      en.*,
      case when lb.metric_type = 'made_of_attempts' then en.value / en.attempts else en.value end as r
    from public.entries en
    cross join lb
    where en.leaderboard_id = p_leaderboard_id
      and (lb.from_at is null or en.achieved_at >= lb.from_at)
      and (p_to is null or en.achieved_at < p_to)
  ),
  numbered as (
    select
      e.*,
      row_number() over (
        partition by e.player_id, e.team_id
        order by
          case when lb.direction = 'higher_better' then e.r end desc nulls last,
          case when lb.direction = 'lower_better' then e.r end asc nulls last,
          e.value desc,
          e.achieved_at asc
      ) as best_rn,
      row_number() over (
        partition by e.player_id, e.team_id
        order by e.achieved_at desc, e.created_at desc
      ) as latest_rn
    from e
    cross join lb
  ),
  agg as (
    select
      n.player_id,
      n.team_id,
      count(*) as entry_count,
      max(n.achieved_at) as last_achieved_at,
      sum(n.value) as total_value,
      sum(n.attempts) as total_attempts,
      avg(n.r) as avg_r,
      max(n.r) filter (where n.best_rn = 1) as best_r,
      max(n.value) filter (where n.best_rn = 1) as best_value,
      max(n.attempts) filter (where n.best_rn = 1) as best_attempts,
      max(n.r) filter (where n.latest_rn = 1) as latest_r,
      max(n.value) filter (where n.latest_rn = 1) as latest_value,
      max(n.attempts) filter (where n.latest_rn = 1) as latest_attempts
    from numbered n
    group by n.player_id, n.team_id
  ),
  scored as (
    select
      a.player_id,
      a.team_id,
      a.entry_count,
      a.last_achieved_at,
      case lb.aggregation
        when 'best' then a.best_r
        when 'latest' then a.latest_r
        when 'average' then a.avg_r
        when 'entry_count' then a.entry_count::numeric
        else case when lb.metric_type = 'made_of_attempts' then a.total_value / a.total_attempts else a.total_value end
      end as score,
      case when lb.metric_type <> 'made_of_attempts' then null
        when lb.aggregation = 'best' then a.best_value
        when lb.aggregation = 'latest' then a.latest_value
        else a.total_value
      end as made,
      case when lb.metric_type <> 'made_of_attempts' then null
        when lb.aggregation = 'best' then a.best_attempts
        when lb.aggregation = 'latest' then a.latest_attempts
        else a.total_attempts
      end as attempts
    from agg a
    cross join lb
  )
  select
    rank() over (
      order by
        case when lb.direction = 'higher_better' then s.score end desc nulls last,
        case when lb.direction = 'lower_better' then s.score end asc nulls last
    ) as rank,
    s.player_id,
    s.team_id,
    s.score,
    s.made,
    s.attempts,
    s.entry_count,
    s.last_achieved_at
  from scored s
  cross join lb
  order by rank, s.last_achieved_at asc;
$$;

-- Everything the TV display needs, keyed by a display link token. Callable
-- without signing in; the token is the credential.
create or replace function public.get_display(p_token text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_link public.display_links%rowtype;
  v_org public.organizations%rowtype;
  v_boards jsonb;
begin
  select * into v_link from public.display_links where token = p_token;
  if not found then
    return null;
  end if;

  update public.display_links set last_seen_at = now() where id = v_link.id;
  select * into v_org from public.organizations where id = v_link.org_id;

  select coalesce(jsonb_agg(board order by board ->> 'name'), '[]'::jsonb) into v_boards
  from (
    select jsonb_build_object(
      'id', l.id,
      'name', l.name,
      'icon', l.icon,
      'metric_type', l.metric_type,
      'unit', l.unit,
      'decimals', l.decimals,
      'direction', l.direction,
      'aggregation', l.aggregation,
      'window', l.default_window,
      'entrant_type', l.entrant_type,
      'standings', coalesce((
        select jsonb_agg(jsonb_build_object(
          'rank', s.rank,
          'name', coalesce(p.display_name, t.name, (
            select string_agg(tp.display_name, ' & ' order by tp.display_name)
            from public.team_members tm
            join public.players tp on tp.id = tm.player_id
            where tm.team_id = s.team_id
          )),
          'avatar', p.avatar,
          'score', s.score,
          'made', s.made,
          'attempts', s.attempts,
          'entry_count', s.entry_count,
          'last_achieved_at', s.last_achieved_at
        ) order by s.rank, s.last_achieved_at)
        from public.leaderboard_standings(l.id, p_window => l.default_window) s
        left join public.players p on p.id = s.player_id
        left join public.teams t on t.id = s.team_id
      ), '[]'::jsonb)
    ) as board
    from public.leaderboards l
    where l.org_id = v_org.id and l.archived_at is null
  ) boards;

  return jsonb_build_object(
    'org', jsonb_build_object('name', v_org.name, 'slug', v_org.slug, 'timezone', v_org.timezone),
    'display_name', v_link.name,
    'generated_at', now(),
    'leaderboards', v_boards
  );
end;
$$;

-- ============================================================
-- GRANTS
-- ============================================================

-- Functions are executable by PUBLIC by default; tighten the ones that matter.
revoke execute on function public.create_organization(text, text, text) from public, anon;
revoke execute on function public.accept_invite(text) from public, anon;
revoke execute on function public.claim_player(uuid) from public, anon;
revoke execute on function public.ensure_my_player(uuid) from public, anon;
revoke execute on function public.find_or_create_team(uuid, uuid[], text) from public, anon;
revoke execute on function public.get_invite(text) from public, anon;

grant execute on function public.create_organization(text, text, text) to authenticated;
grant execute on function public.accept_invite(text) to authenticated;
grant execute on function public.claim_player(uuid) to authenticated;
grant execute on function public.ensure_my_player(uuid) to authenticated;
grant execute on function public.find_or_create_team(uuid, uuid[], text) to authenticated;
grant execute on function public.get_invite(text) to authenticated;
grant execute on function public.get_display(text) to anon, authenticated;

-- ============================================================
-- REALTIME
-- ============================================================

alter publication supabase_realtime add table public.entries;
