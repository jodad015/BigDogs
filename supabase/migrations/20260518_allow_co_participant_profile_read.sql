-- Allow users to read profiles of people in the same challenge
create policy "Users can read co-participant profiles"
  on public.profiles for select
  using (
    public.is_challenge_participant(
      (select challenge_id from public.participants where user_id = profiles.id limit 1),
      auth.uid()
    )
  );
