-- BigDogs initial schema
-- Profiles, challenges, participants, weigh-ins, weekly results

-- ============================================================
-- PROFILES
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  height_inches int,
  age int,
  personal_target_weight numeric(5,1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- CHALLENGES
-- ============================================================

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id),
  name text not null,
  invite_code text not null unique,
  duration_weeks int not null check (duration_weeks in (10, 12, 14, 16)),
  max_participants int not null default 4,
  showdowns_enabled boolean not null default true,
  is_public boolean not null default false,
  timezone text not null default 'America/Chicago',
  spinup_start_date date,
  start_date date,
  status text not null default 'setup' check (status in ('setup', 'spinup', 'active', 'complete')),
  created_at timestamptz not null default now()
);

create index idx_challenges_invite_code on public.challenges(invite_code);
create index idx_challenges_status on public.challenges(status);

alter table public.challenges enable row level security;

-- Policies that don't reference other tables
create policy "Public challenges are readable by anyone"
  on public.challenges for select
  using (is_public = true);

create policy "Creator can insert challenges"
  on public.challenges for insert
  with check (auth.uid() = created_by);

create policy "Creator can update challenge in setup"
  on public.challenges for update
  using (auth.uid() = created_by and status = 'setup');

-- NOTE: "Challenge participants can read" policy is created below,
-- after the participants table exists.

-- ============================================================
-- PARTICIPANTS
-- ============================================================

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  starting_weight numeric(5,1),
  starting_bmi numeric(4,1),
  goal_method text check (goal_method in ('target_weight', 'percent_loss', 'target_bmi', 'weekly_pace', 'suggested_default')),
  goal_input numeric(6,2),
  target_weight numeric(5,1),
  total_loss numeric(5,2),
  weekly_target numeric(4,2),
  healthy_floor_weight numeric(5,1),
  status text not null default 'onboarding' check (status in ('onboarding', 'spinup', 'active', 'maintenance', 'complete')),
  created_at timestamptz not null default now(),
  unique (challenge_id, user_id)
);

create index idx_participants_challenge on public.participants(challenge_id);
create index idx_participants_user on public.participants(user_id);

alter table public.participants enable row level security;

create policy "Participants can read own + co-participants"
  on public.participants for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.participants p2
      where p2.challenge_id = participants.challenge_id
      and p2.user_id = auth.uid()
    )
  );

create policy "Users can join challenges"
  on public.participants for insert
  with check (auth.uid() = user_id);

create policy "Participants can update own record"
  on public.participants for update
  using (auth.uid() = user_id);

-- Deferred from challenges section (requires participants table)
create policy "Challenge participants can read"
  on public.challenges for select
  using (
    auth.uid() = created_by
    or exists (
      select 1 from public.participants
      where participants.challenge_id = challenges.id
      and participants.user_id = auth.uid()
    )
  );

-- ============================================================
-- WEIGH-INS
-- ============================================================

create table public.weigh_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  date date not null,
  weight numeric(5,1) not null check (weight > 0),
  trend_weight numeric(5,1),
  valid_days_count int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  unique (user_id, date)
);

create index idx_weigh_ins_user_date on public.weigh_ins(user_id, date desc);

alter table public.weigh_ins enable row level security;

create policy "Users can read own weigh-ins"
  on public.weigh_ins for select
  using (auth.uid() = user_id);

create policy "Users can insert own weigh-ins"
  on public.weigh_ins for insert
  with check (auth.uid() = user_id);

create policy "Users can update own weigh-ins"
  on public.weigh_ins for update
  using (auth.uid() = user_id);

create policy "Users can delete own weigh-ins"
  on public.weigh_ins for delete
  using (auth.uid() = user_id);

-- ============================================================
-- WEEKLY RESULTS
-- ============================================================

create table public.weekly_results (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  week_number int not null,
  week_start_date date not null,
  week_end_date date not null,
  start_trend numeric(5,1) not null,
  end_trend numeric(5,1) not null,
  weekly_loss numeric(5,2) not null,
  performance_ratio numeric(6,4) not null,
  performance_factor numeric(6,4) not null,
  cumulative_scored_loss numeric(6,2) not null,
  cumulative_progress_pct numeric(6,2) not null,
  difficulty_multiplier numeric(4,2) not null,
  weekly_score numeric(6,3) not null,
  placement int not null check (placement between 1 and 4),
  placement_points int not null,
  is_showdown boolean not null default false,
  is_maintenance boolean not null default false,
  created_at timestamptz not null default now(),
  unique (participant_id, week_number)
);

create index idx_weekly_results_challenge on public.weekly_results(challenge_id);
create index idx_weekly_results_participant on public.weekly_results(participant_id);

alter table public.weekly_results enable row level security;

create policy "Challenge participants can read results"
  on public.weekly_results for select
  using (
    exists (
      select 1 from public.participants
      where participants.challenge_id = weekly_results.challenge_id
      and participants.user_id = auth.uid()
    )
  );

-- Realtime for live leaderboard updates
alter publication supabase_realtime add table public.weekly_results;
