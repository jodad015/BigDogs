-- Fix infinite recursion in participants RLS policy.
-- The old policy did: exists(select from participants) which re-triggers RLS.
-- Use a security definer function to bypass RLS for the co-participant check.

create or replace function public.is_challenge_participant(p_challenge_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.participants
    where challenge_id = p_challenge_id
    and user_id = p_user_id
  );
$$;

-- Drop the recursive policy and replace it
drop policy if exists "Participants can read own + co-participants" on public.participants;

create policy "Participants can read own + co-participants"
  on public.participants for select
  using (
    auth.uid() = user_id
    or public.is_challenge_participant(challenge_id, auth.uid())
  );

-- Also fix the challenges policy that references participants
drop policy if exists "Challenge participants can read" on public.challenges;

create policy "Challenge participants can read"
  on public.challenges for select
  using (
    auth.uid() = created_by
    or public.is_challenge_participant(id, auth.uid())
  );

-- And the weekly_results policy
drop policy if exists "Challenge participants can read results" on public.weekly_results;

create policy "Challenge participants can read results"
  on public.weekly_results for select
  using (
    public.is_challenge_participant(challenge_id, auth.uid())
  );
