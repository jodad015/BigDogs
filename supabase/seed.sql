-- BigDogs seed data for local development. Runs on `supabase db reset`.
-- Password for every user: "password"
--
--   admin@bigdogs.app  platform admin, owner of Acme Office
--   alice@bigdogs.app  Acme Office admin, also a member of Garage Gym
--   bob@bigdogs.app    Acme Office member
--   carol@bigdogs.app  Acme Office member, owner of Garage Gym
--   dave@bigdogs.app   not in any org yet; claim the unclaimed "Dave" player
--                      with invite code CLAIMDAVE
--
-- TV display: http://localhost:5180/tv/local-display-token

-- ============================================================
-- USERS
-- ============================================================

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change,
  email_change_token_new, email_change_token_current,
  phone, phone_change, phone_change_token, reauthentication_token,
  is_sso_user, is_anonymous
)
select
  '00000000-0000-0000-0000-000000000000', u.id::uuid, 'authenticated', 'authenticated',
  u.email, crypt('password', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('email', u.email, 'display_name', u.name, 'email_verified', true),
  '', '', '', '', '', null, '', '', '', false, false
from (values
  ('00000000-0000-0000-0000-00000000000a', 'admin@bigdogs.app', 'Admin'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'alice@bigdogs.app', 'Alice'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bob@bigdogs.app', 'Bob'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'carol@bigdogs.app', 'Carol'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'dave@bigdogs.app', 'Dave')
) as u(id, email, name);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), id, id::text, jsonb_build_object('sub', id::text, 'email', email), 'email', now(), now(), now()
from auth.users;

update public.profiles set avatar = 'sky'   where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
update public.profiles set avatar = 'gold'  where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
update public.profiles set avatar = 'mint'  where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
update public.profiles set avatar = 'plum'  where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

insert into public.platform_admins (user_id) values ('00000000-0000-0000-0000-00000000000a');

-- ============================================================
-- ORGANIZATIONS
-- ============================================================

insert into public.organizations (id, name, slug, created_by) values
  ('10000000-0000-0000-0000-000000000001', 'Acme Office', 'acme-office', '00000000-0000-0000-0000-00000000000a'),
  ('10000000-0000-0000-0000-000000000002', 'Garage Gym', 'garage-gym', 'cccccccc-cccc-cccc-cccc-cccccccccccc');

insert into public.org_members (org_id, user_id, role) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'owner'),
  ('10000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin'),
  ('10000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'member'),
  ('10000000-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'member'),
  ('10000000-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'owner'),
  ('10000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'member');

-- ============================================================
-- PLAYERS
-- ============================================================

insert into public.players (id, org_id, display_name, avatar, user_id, created_by) values
  -- Acme Office
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Alice', 'sky',     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Bob',   'gold',    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Carol', 'mint',    'cccccccc-cccc-cccc-cccc-cccccccccccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Dave',  'plum',    null,                                   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'Erin',  'crimson', null,                                   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  -- Garage Gym
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000002', 'Carol', 'mint',    'cccccccc-cccc-cccc-cccc-cccccccccccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000002', 'Alice', 'sky',     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- ============================================================
-- TEAMS (Acme Office)
-- ============================================================

insert into public.teams (id, org_id, name, created_by) values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Bag Daddies', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', null,          'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', null,          'cccccccc-cccc-cccc-cccc-cccccccccccc');

insert into public.team_members (team_id, player_id, org_id) values
  -- Alice & Bob
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001'),
  -- Carol & Dave
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001'),
  -- Alice & Erin (Alice is on two teams)
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001');

-- ============================================================
-- LEADERBOARDS
-- ============================================================

insert into public.leaderboards (
  id, org_id, name, description, icon, metric_type, unit, decimals, default_attempts,
  direction, aggregation, default_window, entrant_type, team_size, created_by
) values
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   'Dead Hang', 'Longest hang from the bar by the kitchen. No straps.', '🧗',
   'duration', 'sec', 1, null, 'higher_better', 'best', 'all_time', 'player', null,
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
   'Pull-ups', 'Max strict pull-ups in one set.', '💪',
   'count', 'reps', 0, null, 'higher_better', 'best', 'month', 'player', null,
   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001',
   'Hallway Putting', '10 putts from the copier. Best make rate this month.', '⛳',
   'made_of_attempts', 'putts', 0, 10, 'higher_better', 'sum', 'month', 'player', null,
   'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001',
   'Paper Plane Distance', 'Throw from the break room door.', '✈️',
   'distance', 'ft', 1, null, 'higher_better', 'best', 'all_time', 'player', null,
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001',
   'Cornhole Doubles', 'Points per game, partners required.', '🌽',
   'points', 'pts', 0, null, 'higher_better', 'average', 'quarter', 'team', 2,
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('40000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001',
   'Rubik''s Cube', 'Fastest solve.', '🧊',
   'duration', 'sec', 2, null, 'lower_better', 'best', 'all_time', 'player', null,
   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('40000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000002',
   'Plank', 'Longest forearm plank.', '🪵',
   'duration', 'sec', 0, null, 'higher_better', 'best', 'all_time', 'player', null,
   'cccccccc-cccc-cccc-cccc-cccccccccccc');

-- ============================================================
-- ENTRIES (spread over the last ~5 weeks)
-- ============================================================

insert into public.entries (leaderboard_id, org_id, player_id, team_id, value, attempts, achieved_at, recorded_by) values
  -- Dead Hang (ms)
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', null,  72400, null, now() - interval '30 days', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', null,  81200, null, now() - interval '9 days',  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', null,  95700, null, now() - interval '20 days', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', null,  64000, null, now() - interval '3 days',  'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', null, 102300, null, now() - interval '1 day',   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', null,  58900, null, now() - interval '12 days', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  -- Pull-ups
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', null, 12, null, now() - interval '2 days',  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', null, 18, null, now() - interval '4 days',  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', null, 15, null, now() - interval '40 days', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', null, 12, null, now() - interval '1 day',   'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', null,  9, null, now() - interval '6 hours', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  -- Hallway Putting (made of attempts)
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', null, 6, 10, now() - interval '3 days',  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', null, 8, 10, now() - interval '1 day',   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', null, 7, 10, now() - interval '2 days',  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', null, 9, 10, now() - interval '5 hours', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', null, 5, 10, now() - interval '4 days',  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  -- Paper Plane Distance (ft)
  ('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', null, 41.5, null, now() - interval '15 days', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', null, 47.0, null, now() - interval '8 days',  'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', null, 47.0, null, now() - interval '2 days',  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  -- Cornhole Doubles (teams)
  ('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', null, '30000000-0000-0000-0000-000000000001', 21, null, now() - interval '6 days', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', null, '30000000-0000-0000-0000-000000000001', 15, null, now() - interval '2 days', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', null, '30000000-0000-0000-0000-000000000002', 21, null, now() - interval '6 days', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', null, '30000000-0000-0000-0000-000000000003', 11, null, now() - interval '1 day',  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  -- Rubik's Cube (ms, lower is better)
  ('40000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', null, 48230, null, now() - interval '10 days', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('40000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', null, 95110, null, now() - interval '3 days',  'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  -- Garage Gym plank
  ('40000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000011', null, 185000, null, now() - interval '5 days', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('40000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000012', null, 140000, null, now() - interval '2 days', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- ============================================================
-- INVITES & DISPLAY LINKS
-- ============================================================

insert into public.org_invites (org_id, code, role, player_id, created_by) values
  ('10000000-0000-0000-0000-000000000001', 'ACMEJOIN',  'member', null,                                   '00000000-0000-0000-0000-00000000000a'),
  ('10000000-0000-0000-0000-000000000001', 'CLAIMDAVE', 'member', '20000000-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

insert into public.display_links (org_id, name, token, created_by) values
  ('10000000-0000-0000-0000-000000000001', 'Kitchen tablet', 'local-display-token', '00000000-0000-0000-0000-00000000000a');
