-- Enable pgmq extension
create extension if not exists pgmq;

-- Create the scoring jobs queue
select pgmq.create('scoring_jobs');

-- Public wrapper functions for pgmq (Edge Functions need public schema access)
create or replace function public.pgmq_send(
  queue_name text,
  message jsonb,
  delay integer default 0
) returns bigint
language plpgsql security definer
as $$
begin
  return pgmq.send(queue_name, message, delay);
end;
$$;

create or replace function public.pgmq_read(
  queue_name text,
  sleep_seconds integer default 0,
  n integer default 1
) returns setof pgmq.message_record
language plpgsql security definer
as $$
begin
  return query select * from pgmq.read(queue_name, sleep_seconds, n);
end;
$$;

create or replace function public.pgmq_archive(
  queue_name text,
  message_id bigint
) returns boolean
language plpgsql security definer
as $$
begin
  return pgmq.archive(queue_name, message_id);
end;
$$;

-- Grant execute to authenticated and service_role
grant execute on function public.pgmq_send to authenticated, service_role;
grant execute on function public.pgmq_read to service_role;
grant execute on function public.pgmq_archive to service_role;

-- pg_cron: nightly backup check for unscored weeks (midnight Pacific)
-- Note: pg_cron may need to be enabled in Supabase dashboard first
-- select cron.schedule(
--   'nightly-scoring-check',
--   '0 7 * * *',  -- midnight Pacific = 7 AM UTC
--   $$
--   select public.pgmq_send('scoring_jobs',
--     jsonb_build_object('type', 'nightly_check')
--   );
--   $$
-- );
