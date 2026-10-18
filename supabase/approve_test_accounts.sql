-- =============================================================================
-- Approve the 5 test accounts (run by hand in the Supabase SQL Editor)
-- =============================================================================
-- What this file does, in plain words:
--   Since the sign-up guard exists (migration 9), a new login can only be
--   created if its email is on the approved list OR the person has a good
--   invite code. This file puts the 5 test people on the approved list, with
--   their role and name, so you can create their logins by hand.
--
-- WHEN TO RUN IT
--   Only when you rebuild the test data from nothing, in this order:
--     1. Run THIS file (it approves the 5 emails).
--     2. Supabase dashboard > Authentication > Users > Add user > Create new
--        user, for each of the 5 emails. Tick "Auto Confirm User". Choose your
--        own test password for each one and keep it private. The guard then
--        creates each profile by itself, with the right role and name.
--     3. Run supabase/seed.sql (machines and the 4 story reports).
--
--   The 5 accounts that already exist are not affected. Running this file again
--   is safe: it skips anything that is already there.
--
-- To approve one more person by hand (for example a new owner), add a line to
-- the list below, or run the same kind of insert on its own.
--
-- Test data only. Never use real people or real passwords here.
-- =============================================================================

insert into public.approved_accounts (email, role, display_name) values
  ('nila@example.com',   'worker',     'Nila Akter'),
  ('tariq@example.com',  'technician', 'Tariq Hasan'),
  ('hasan@example.com',  'technician', 'Hasan Ali'),
  ('farhan@example.com', 'manager',    'Farhan Kabir'),
  ('owner@example.com',  'owner',      'Mr. Rahman')
on conflict (email) do nothing;
