-- =============================================================================
-- Reset the demo data (run by hand in the Supabase SQL Editor)
-- =============================================================================
-- What this file does, in plain words:
--   Every test and every rehearsal leaves clutter behind: extra reports,
--   changed statuses, busy technicians. This file puts the REPORTS back to a
--   clean slate, so you can start from the story in supabase/seed.sql again.
--
-- HOW TO USE (two steps, in this order):
--   1. Run THIS file.   (it deletes all reports)
--   2. Run supabase/seed.sql.  (it puts the 4 story reports back)
--
-- AFTER BOTH STEPS the database holds exactly:
--   * the 5 test people and 5 machines (this file does not touch them),
--   * 4 reports: one in progress with Tariq (so he is busy), two waiting in
--     the queue, and one resolved by Hasan (a past job). Hasan is free.
--
-- SAFETY: this file refuses to run if it finds any account whose email does
-- not end in "@example.com". That way it can never wipe the reports of a real
-- factory by accident. Test accounts only.
--
-- This deletes data. Do not run it unless you mean it.
-- =============================================================================

do $$
declare
  v_real_accounts int;
begin
  select count(*) into v_real_accounts
  from public.profiles
  where email not like '%@example.com';

  if v_real_accounts > 0 then
    raise exception
      'Reset refused: found % account(s) that do not end in @example.com. This file is for test data only.',
      v_real_accounts;
  end if;
end;
$$;

-- Delete every report. People, machines and logins stay.
delete from public.reports;

-- Now run supabase/seed.sql to put the 4 story reports back.
