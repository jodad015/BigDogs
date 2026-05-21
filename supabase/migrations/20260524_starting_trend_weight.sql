-- Snapshot trend weight on challenge start day as the official baseline.
-- starting_weight (set at onboarding) remains the user's stated weight at
-- signup and is used only to seed target_weight / weekly_target. All
-- challenge progress is computed against starting_trend_weight.

alter table public.participants
  add column starting_trend_weight numeric(5,1);

-- Idempotent: no-op if challenge hasn't started or column is already set.
-- Uses the user's latest weigh_ins row with date <= challenge.start_date.
create or replace function public.ensure_starting_trend_weight(p_participant_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_start_date date;
  v_existing numeric(5,1);
  v_trend numeric(5,1);
begin
  select p.user_id, c.start_date, p.starting_trend_weight
    into v_user_id, v_start_date, v_existing
  from public.participants p
  join public.challenges c on c.id = p.challenge_id
  where p.id = p_participant_id;

  if v_user_id is null then return; end if;
  if v_existing is not null then return; end if;
  if v_start_date is null or v_start_date > current_date then return; end if;

  select trend_weight into v_trend
  from public.weigh_ins
  where user_id = v_user_id
    and date <= v_start_date
  order by date desc
  limit 1;

  if v_trend is null then return; end if;

  update public.participants
     set starting_trend_weight = v_trend
   where id = p_participant_id;
end;
$$;

grant execute on function public.ensure_starting_trend_weight(uuid) to authenticated;
