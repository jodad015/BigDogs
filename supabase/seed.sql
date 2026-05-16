-- BigDogs seed data for local development
-- This file runs on `supabase db reset`
-- Two demo users: alice and bob (password: "password" for both)

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change,
  email_change_token_new, email_change_token_current,
  phone, phone_change, phone_change_token, reauthentication_token,
  is_sso_user, is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'authenticated', 'authenticated',
  'alice@bigdogs.app',
  crypt('password', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"email":"alice@bigdogs.app","display_name":"Alice","email_verified":true}',
  '', '', '', '', '', NULL, '', '', '',
  false, false
), (
  '00000000-0000-0000-0000-000000000000',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'authenticated', 'authenticated',
  'bob@bigdogs.app',
  crypt('password', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"email":"bob@bigdogs.app","display_name":"Bob","email_verified":true}',
  '', '', '', '', '', NULL, '', '', '',
  false, false
);

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  jsonb_build_object('sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'email', 'alice@bigdogs.app'),
  'email', now(), now(), now()
), (
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  jsonb_build_object('sub', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'email', 'bob@bigdogs.app'),
  'email', now(), now(), now()
);

-- Update Bob's profile with height/age/target
UPDATE public.profiles SET
  height_inches = 70,
  age = 34,
  personal_target_weight = 175.0
WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- Bob's weigh-in history (14 days, starting ~195 trending down)
INSERT INTO public.weigh_ins (user_id, date, weight, trend_weight) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 13, 195.8, 195.8),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 12, 195.2, 195.6),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 11, 196.0, 195.7),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 10, 194.8, 195.5),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 9,  194.4, 195.2),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 8,  195.0, 195.2),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 7,  194.2, 195.0),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 6,  193.6, 194.7),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 5,  194.0, 194.5),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 4,  193.2, 194.2),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 3,  192.8, 193.9),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 2,  193.4, 193.8),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date - 1,  192.6, 193.5),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_date,      192.2, 193.2);
