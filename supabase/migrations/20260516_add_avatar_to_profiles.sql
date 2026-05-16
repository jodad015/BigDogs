-- Add avatar column to profiles
alter table public.profiles
  add column avatar text not null default 'crimson';
