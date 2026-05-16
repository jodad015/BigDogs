-- Allow users to read weigh-ins of people in the same challenge
-- Only trend data is shown — the participant detail page needs this
create policy "Co-participants can read weigh-ins"
  on public.weigh_ins for select
  using (
    public.is_challenge_participant(
      (select challenge_id from public.participants where user_id = weigh_ins.user_id limit 1),
      auth.uid()
    )
  );
