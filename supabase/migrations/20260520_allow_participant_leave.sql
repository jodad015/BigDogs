-- Allow participants to remove themselves from a challenge
create policy "Participants can leave challenges"
  on public.participants for delete
  using (auth.uid() = user_id);
