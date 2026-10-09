-- guard_last_owner ran with the caller's permissions. When the last owner
-- deleted their own membership, RLS hid the organization from them inside the
-- trigger, so it looked like the org was being deleted and the guard let the
-- delete through. Run it as the function owner so it sees the real state.

alter function public.guard_last_owner() security definer;
