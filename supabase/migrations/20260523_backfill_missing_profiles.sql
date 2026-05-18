-- Backfill profiles for any auth.users that don't have one yet
-- This handles users who signed up before the trigger was fixed
insert into public.profiles (id, email, display_name)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(
    u.raw_user_meta_data ->> 'display_name',
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'name',
    split_part(coalesce(u.email, ''), '@', 1)
  )
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
