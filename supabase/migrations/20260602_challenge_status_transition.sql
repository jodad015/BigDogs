-- Date-based status transitions for challenges and participants.
-- The app had no automated transitions, so a challenge whose start_date
-- had passed still showed as 'spinup' in the DB. This adds an idempotent
-- function the client can call (and that we backfill once here) to advance
-- statuses based on the current date.

create or replace function public.transition_challenge_statuses()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Challenges: setup → spinup (when spinup_start_date arrives)
  update public.challenges
  set status = 'spinup'
  where status = 'setup'
    and spinup_start_date is not null
    and current_date >= spinup_start_date;

  -- Challenges: spinup → active (when start_date arrives)
  update public.challenges
  set status = 'active'
  where status = 'spinup'
    and start_date is not null
    and current_date >= start_date;

  -- Challenges: active → complete (after duration_weeks past start)
  update public.challenges
  set status = 'complete'
  where status = 'active'
    and start_date is not null
    and current_date > (start_date + (duration_weeks * 7));

  -- Participants: spinup → active when their challenge is active
  update public.participants p
  set status = 'active'
  from public.challenges c
  where p.challenge_id = c.id
    and p.status = 'spinup'
    and c.status = 'active';

  -- Participants: active / maintenance → complete when challenge is complete
  update public.participants p
  set status = 'complete'
  from public.challenges c
  where p.challenge_id = c.id
    and p.status in ('active', 'maintenance')
    and c.status = 'complete';
end;
$$;

grant execute on function public.transition_challenge_statuses() to authenticated;

-- Backfill: run once now to fix any rows whose dates have already passed.
select public.transition_challenge_statuses();
