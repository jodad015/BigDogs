-- BigDogs seed data for local development
-- This file runs on `supabase db reset`
-- Users: alice, bob, carol, dave, eve, frank (password: "password" for all)

-- ============================================================
-- USERS
-- ============================================================

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change,
  email_change_token_new, email_change_token_current,
  phone, phone_change, phone_change_token, reauthentication_token,
  is_sso_user, is_anonymous
) VALUES
(
  '00000000-0000-0000-0000-000000000000',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'authenticated', 'authenticated',
  'alice@bigdogs.app', crypt('password', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"email":"alice@bigdogs.app","display_name":"Alice","email_verified":true}',
  '', '', '', '', '', NULL, '', '', '', false, false
), (
  '00000000-0000-0000-0000-000000000000',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'authenticated', 'authenticated',
  'bob@bigdogs.app', crypt('password', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"email":"bob@bigdogs.app","display_name":"Bob","email_verified":true}',
  '', '', '', '', '', NULL, '', '', '', false, false
), (
  '00000000-0000-0000-0000-000000000000',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'authenticated', 'authenticated',
  'carol@bigdogs.app', crypt('password', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"email":"carol@bigdogs.app","display_name":"Carol","email_verified":true}',
  '', '', '', '', '', NULL, '', '', '', false, false
), (
  '00000000-0000-0000-0000-000000000000',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'authenticated', 'authenticated',
  'dave@bigdogs.app', crypt('password', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"email":"dave@bigdogs.app","display_name":"Dave","email_verified":true}',
  '', '', '', '', '', NULL, '', '', '', false, false
), (
  '00000000-0000-0000-0000-000000000000',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'authenticated', 'authenticated',
  'eve@bigdogs.app', crypt('password', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"email":"eve@bigdogs.app","display_name":"Eve","email_verified":true}',
  '', '', '', '', '', NULL, '', '', '', false, false
), (
  '00000000-0000-0000-0000-000000000000',
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'authenticated', 'authenticated',
  'frank@bigdogs.app', crypt('password', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"email":"frank@bigdogs.app","display_name":"Frank","email_verified":true}',
  '', '', '', '', '', NULL, '', '', '', false, false
);

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) VALUES
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   jsonb_build_object('sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'email', 'alice@bigdogs.app'),
   'email', now(), now(), now()),
  (gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   jsonb_build_object('sub', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'email', 'bob@bigdogs.app'),
   'email', now(), now(), now()),
  (gen_random_uuid(), 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
   jsonb_build_object('sub', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'email', 'carol@bigdogs.app'),
   'email', now(), now(), now()),
  (gen_random_uuid(), 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'dddddddd-dddd-dddd-dddd-dddddddddddd',
   jsonb_build_object('sub', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'email', 'dave@bigdogs.app'),
   'email', now(), now(), now()),
  (gen_random_uuid(), 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
   jsonb_build_object('sub', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'email', 'eve@bigdogs.app'),
   'email', now(), now(), now()),
  (gen_random_uuid(), 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'ffffffff-ffff-ffff-ffff-ffffffffffff',
   jsonb_build_object('sub', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'email', 'frank@bigdogs.app'),
   'email', now(), now(), now());

-- ============================================================
-- PROFILES
-- ============================================================

UPDATE public.profiles SET height_inches = 65, age = 29, personal_target_weight = 140.0, avatar = 'sky'
WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

UPDATE public.profiles SET height_inches = 70, age = 34, personal_target_weight = 175.0, avatar = 'crimson'
WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

UPDATE public.profiles SET height_inches = 63, age = 42, personal_target_weight = 155.0, avatar = 'mint'
WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

UPDATE public.profiles SET height_inches = 72, age = 26, personal_target_weight = 190.0, avatar = 'gold'
WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

UPDATE public.profiles SET height_inches = 67, age = 31, personal_target_weight = 150.0, avatar = 'plum'
WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

UPDATE public.profiles SET height_inches = 71, age = 38, personal_target_weight = 195.0, avatar = 'sage'
WHERE id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

-- ============================================================
-- CHALLENGE — "Office BigDogs Q3" (12 weeks, started 4 weeks ago)
-- ============================================================

INSERT INTO public.challenges (
  id, created_by, name, invite_code, duration_weeks, max_participants,
  showdowns_enabled, is_public, timezone, spinup_start_date, start_date, status
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Office BigDogs Q3', 'BDOG-X7K9', 12, 8,
  true, true, 'America/Chicago',
  (current_date - 35)::date,
  (current_date - 28)::date,
  'active'
);

-- ============================================================
-- PARTICIPANTS — Alice, Carol, Dave in the active challenge
-- (Bob is in a separate upcoming challenge — see below)
-- ============================================================

INSERT INTO public.participants (
  id, challenge_id, user_id, starting_weight, target_weight, total_loss,
  weekly_target, goal_method, goal_input, status
) VALUES
  -- Alice: 158 → 140, losing ~1.5/wk
  ('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   '11111111-1111-1111-1111-111111111111',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   158.0, 140.0, 18.0, 1.5, 'target_weight', 140.0, 'active'),
  -- Carol: 170 → 155, losing ~1.25/wk
  ('cccc1111-cccc-cccc-cccc-cccccccccccc',
   '11111111-1111-1111-1111-111111111111',
   'cccccccc-cccc-cccc-cccc-cccccccccccc',
   170.0, 155.0, 15.0, 1.25, 'target_weight', 155.0, 'active'),
  -- Dave: 215 → 190, losing ~2.0/wk
  ('dddd1111-dddd-dddd-dddd-dddddddddddd',
   '11111111-1111-1111-1111-111111111111',
   'dddddddd-dddd-dddd-dddd-dddddddddddd',
   215.0, 190.0, 25.0, 2.0, 'target_weight', 190.0, 'active');

-- ============================================================
-- WEIGH-INS (28 days for all 4 participants — spinup + 3 scored weeks)
-- ============================================================

-- Alice: 158 → ~152, steady loser
INSERT INTO public.weigh_ins (user_id, date, weight, trend_weight) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 34, 158.0, 158.0),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 33, 157.6, 157.9),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 32, 158.2, 157.9),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 31, 157.4, 157.8),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 30, 157.0, 157.6),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 29, 157.8, 157.6),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 28, 157.2, 157.5),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 27, 156.8, 157.3),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 26, 157.0, 157.2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 25, 156.4, 157.0),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 24, 156.0, 156.8),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 23, 156.6, 156.7),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 22, 155.8, 156.5),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 21, 155.4, 156.3),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 20, 155.8, 156.2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 19, 155.2, 156.0),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 18, 154.8, 155.7),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 17, 155.4, 155.7),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 16, 154.6, 155.4),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 15, 154.2, 155.2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 14, 154.8, 155.1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 13, 154.0, 154.9),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 12, 153.6, 154.6),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 11, 154.2, 154.6),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 10, 153.4, 154.3),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 9,  153.0, 154.1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 8,  153.6, 154.0),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 7,  152.8, 153.8),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 6,  152.4, 153.5),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 5,  153.0, 153.4),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 4,  152.2, 153.2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 3,  151.8, 152.9),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 2,  152.4, 152.8),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - 1,  151.6, 152.6),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date,      151.2, 152.4);

-- Bob: 195 → ~189, solid progress
INSERT INTO public.weigh_ins (user_id, date, weight, trend_weight) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 34, 195.8, 195.8),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 33, 195.2, 195.6),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 32, 196.0, 195.7),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 31, 194.8, 195.5),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 30, 194.4, 195.2),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 29, 195.0, 195.2),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 28, 194.2, 195.0),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 27, 193.6, 194.7),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 26, 194.0, 194.5),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 25, 193.2, 194.2),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 24, 192.8, 193.9),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 23, 193.4, 193.8),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 22, 192.6, 193.5),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 21, 192.2, 193.2),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 20, 192.8, 193.2),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 19, 191.6, 192.8),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 18, 191.2, 192.5),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 17, 192.0, 192.4),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 16, 191.0, 192.1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 15, 190.6, 191.8),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 14, 191.2, 191.7),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 13, 190.4, 191.4),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 12, 190.0, 191.1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 11, 190.8, 191.1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 10, 189.8, 190.8),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 9,  189.4, 190.5),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 8,  190.0, 190.4),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 7,  189.2, 190.1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 6,  188.8, 189.8),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 5,  189.4, 189.7),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 4,  188.6, 189.5),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 3,  188.2, 189.2),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 2,  188.8, 189.1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 1,  188.0, 188.9),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date,      187.6, 188.6);

-- Carol: 170 → ~166, slower but consistent
INSERT INTO public.weigh_ins (user_id, date, weight, trend_weight) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 34, 170.0, 170.0),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 33, 169.8, 169.9),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 32, 170.2, 170.0),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 31, 169.4, 169.8),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 30, 169.6, 169.8),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 29, 169.2, 169.6),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 28, 169.0, 169.5),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 27, 168.8, 169.3),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 26, 169.2, 169.3),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 25, 168.6, 169.1),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 24, 168.2, 168.9),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 23, 168.8, 168.9),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 22, 168.0, 168.7),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 21, 167.8, 168.5),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 20, 168.2, 168.4),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 19, 167.6, 168.2),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 18, 167.2, 168.0),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 17, 167.8, 167.9),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 16, 167.0, 167.7),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 15, 166.8, 167.5),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 14, 167.2, 167.5),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 13, 166.6, 167.3),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 12, 166.2, 167.0),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 11, 166.8, 167.0),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 10, 166.0, 166.8),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 9,  165.8, 166.6),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 8,  166.4, 166.5),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 7,  165.6, 166.3),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 6,  165.4, 166.1),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 5,  166.0, 166.1),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 4,  165.2, 165.9),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 3,  165.0, 165.7),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 2,  165.6, 165.7),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date - 1,  164.8, 165.5),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', current_date,      164.6, 165.3);

-- Dave: 215 → ~208, aggressive but some bumps
INSERT INTO public.weigh_ins (user_id, date, weight, trend_weight) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 34, 215.0, 215.0),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 33, 214.2, 214.8),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 32, 215.4, 214.9),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 31, 213.8, 214.6),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 30, 213.2, 214.3),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 29, 214.0, 214.2),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 28, 213.0, 213.9),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 27, 212.4, 213.6),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 26, 213.0, 213.4),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 25, 211.8, 213.0),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 24, 211.2, 212.6),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 23, 212.0, 212.5),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 22, 211.0, 212.1),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 21, 210.6, 211.8),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 20, 211.4, 211.7),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 19, 210.2, 211.3),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 18, 209.8, 211.0),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 17, 210.6, 210.9),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 16, 209.4, 210.5),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 15, 209.0, 210.2),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 14, 210.0, 210.1),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 13, 208.8, 209.8),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 12, 208.4, 209.4),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 11, 209.2, 209.4),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 10, 208.0, 209.0),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 9,  207.6, 208.7),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 8,  208.4, 208.6),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 7,  207.2, 208.3),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 6,  206.8, 207.9),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 5,  207.6, 207.9),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 4,  206.4, 207.5),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 3,  206.0, 207.2),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 2,  206.8, 207.1),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date - 1,  205.8, 206.8),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', current_date,      205.4, 206.5);

-- ============================================================
-- WEEKLY RESULTS (3 scored weeks, 3 participants — 3/2/1 points)
-- ============================================================

-- Week 1 (days 21-28 ago)
INSERT INTO public.weekly_results (
  participant_id, challenge_id, week_number, week_start_date, week_end_date,
  start_trend, end_trend, weekly_loss, performance_ratio, performance_factor,
  cumulative_scored_loss, cumulative_progress_pct, difficulty_multiplier,
  weekly_score, placement, placement_points, is_showdown, is_maintenance
) VALUES
  -- Alice: -1.6 lb (target 1.5) → factor 0.94 → 1st
  ('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111',
   1, current_date - 27, current_date - 21, 157.5, 156.3, -1.6, 1.07, 0.94,
   1.6, 8.9, 1.0, 2.51, 1, 3, false, false),
  -- Dave: -2.2 lb (target 2.0) → factor 0.90 → 2nd
  ('dddd1111-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111',
   1, current_date - 27, current_date - 21, 213.9, 211.8, -2.2, 1.10, 0.90,
   2.2, 8.8, 1.0, 1.89, 2, 2, false, false),
  -- Carol: -0.8 lb (target 1.25) → factor 0.56 → 3rd
  ('cccc1111-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111',
   1, current_date - 27, current_date - 21, 169.5, 168.5, -0.8, 0.64, 0.56,
   0.8, 5.3, 1.0, 1.12, 3, 1, false, false),

-- Week 2 (days 14-21 ago)
  -- Dave: -1.8 lb → factor 0.82 → 1st
  ('dddd1111-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111',
   2, current_date - 20, current_date - 14, 211.8, 210.1, -1.8, 0.90, 0.82,
   4.0, 16.0, 1.0, 2.67, 1, 3, false, false),
  -- Alice: -1.4 lb → factor 0.85 → 2nd
  ('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111',
   2, current_date - 20, current_date - 14, 156.3, 155.1, -1.4, 0.93, 0.85,
   3.0, 16.7, 1.0, 2.18, 2, 2, false, false),
  -- Carol: -1.2 lb → factor 0.88 → 3rd
  ('cccc1111-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111',
   2, current_date - 20, current_date - 14, 168.5, 167.5, -1.2, 0.96, 0.88,
   2.0, 13.3, 1.0, 1.65, 3, 1, false, false),

-- Week 3 (days 7-14 ago)
  -- Alice: -1.3 lb → factor 0.78 → 1st
  ('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111',
   3, current_date - 13, current_date - 7, 155.1, 153.8, -1.3, 0.87, 0.78,
   4.3, 23.9, 1.0, 2.01, 1, 3, false, false),
  -- Carol: -1.0 lb → factor 0.72 → 2nd
  ('cccc1111-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111',
   3, current_date - 13, current_date - 7, 167.5, 166.3, -1.0, 0.80, 0.72,
   3.0, 20.0, 1.0, 1.45, 2, 2, false, false),
  -- Dave: -1.4 lb → factor 0.62 (off pace) → 3rd
  ('dddd1111-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111',
   3, current_date - 13, current_date - 7, 210.1, 208.3, -1.4, 0.70, 0.62,
   5.4, 21.6, 1.0, 1.22, 3, 1, false, false);

-- ============================================================
-- BOB'S CHALLENGE — "Spring Throwdown" (starts in 7 days)
-- Bob in spinup; challenge demonstrates pre-start UI state.
-- ============================================================

INSERT INTO public.challenges (
  id, created_by, name, invite_code, duration_weeks, max_participants,
  showdowns_enabled, is_public, timezone, spinup_start_date, start_date, status
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Spring Throwdown', 'BDOG-S7P3', 10, 8,
  true, false, 'America/Chicago',
  current_date::date,
  (current_date + 7)::date,
  'spinup'
);

INSERT INTO public.participants (
  id, challenge_id, user_id, starting_weight, target_weight, total_loss,
  weekly_target, goal_method, goal_input, status
) VALUES
  -- Bob: 189 → 175, goal set, awaiting start
  ('bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '22222222-2222-2222-2222-222222222222',
   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   189.0, 175.0, 14.0, 1.5, 'target_weight', 175.0, 'spinup'),
  -- Eve: 162 → 150, goal set, awaiting start
  ('eeee2222-eeee-eeee-eeee-eeeeeeeeeeee',
   '22222222-2222-2222-2222-222222222222',
   'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
   162.0, 150.0, 12.0, 1.25, 'target_weight', 150.0, 'spinup'),
  -- Frank: no goal yet (still onboarding)
  ('ffff2222-ffff-ffff-ffff-ffffffffffff',
   '22222222-2222-2222-2222-222222222222',
   'ffffffff-ffff-ffff-ffff-ffffffffffff',
   NULL, NULL, NULL, NULL, NULL, NULL, 'onboarding');

-- Weigh-ins for Eve: 14 days of pre-challenge history, holding around 162
INSERT INTO public.weigh_ins (user_id, date, weight, trend_weight) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', current_date - 13, 162.4, 162.4),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', current_date - 12, 162.0, 162.3),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', current_date - 11, 162.6, 162.4),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', current_date - 10, 161.8, 162.2),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', current_date - 9,  162.2, 162.2),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', current_date - 8,  161.6, 162.1),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', current_date - 7,  162.0, 162.1),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', current_date - 6,  161.4, 161.9),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', current_date - 5,  161.8, 161.9),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', current_date - 4,  162.2, 162.0),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', current_date - 3,  161.6, 161.9),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', current_date - 2,  161.4, 161.8),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', current_date - 1,  162.0, 161.8),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', current_date,      161.8, 161.8);

-- Weigh-ins for Frank: just a few recent entries (still onboarding)
INSERT INTO public.weigh_ins (user_id, date, weight, trend_weight) VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', current_date - 3, 218.4, 218.4),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', current_date - 2, 217.8, 218.2),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', current_date - 1, 218.2, 218.2),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', current_date,     217.6, 218.0);
