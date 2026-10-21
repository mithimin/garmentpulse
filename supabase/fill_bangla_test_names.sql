-- =============================================================================
-- Fill in the Bangla names of the 5 test people and 5 test machines
-- (run by hand in the Supabase SQL Editor)
-- =============================================================================
-- What this file does, in plain words:
--   The Bangla name columns (profiles.display_name_bn and machines.name_bn)
--   start EMPTY. In Bangla mode the apps then show the English-letter name.
--   This file writes the Bangla spelling of the 10 test names, so Bangla mode
--   shows them in Bangla letters on the phone app and on the website.
--
-- Where the spellings come from:
--   Nothing is translated automatically. The team first wrote a draft, and a
--   Bangla speaker read it and said all ten are OK (docs/bangla-review-sheet.md,
--   Part B, checked on 2026-10-21).
--
-- WHEN TO RUN IT (important):
--   Run it AFTER supabase/tests/api_rules_check.sql, never before. That check
--   expects the Bangla names to be empty. The usual order is:
--     reset_demo_data.sql -> seed.sql -> api_rules_check.sql -> THIS FILE
--   reset_demo_data.sql empties these names again, so the next round of checks
--   starts clean. Running THIS file again is safe: it writes the same words.
--
-- SAFETY: it only changes the Bangla name of the 10 test rows. It refuses to
-- finish (and changes nothing) unless it finds exactly 5 people and 5 machines.
-- =============================================================================

do $$
declare
  v_people   int;
  v_machines int;
begin
  update public.profiles p
  set display_name_bn = v.bn
  from (values
    ('nila@example.com',   'নীলা আক্তার'),
    ('tariq@example.com',  'তারিক হাসান'),
    ('hasan@example.com',  'হাসান আলী'),
    ('farhan@example.com', 'ফারহান কবির'),
    ('owner@example.com',  'জনাব রহমান')
  ) as v (email, bn)
  where p.email = v.email;
  get diagnostics v_people = row_count;

  update public.machines m
  set name_bn = v.bn
  from (values
    ('Sewing machine 01',   'সেলাই মেশিন ০১'),
    ('Sewing machine 02',   'সেলাই মেশিন ০২'),
    ('Sewing machine 14',   'সেলাই মেশিন ১৪'),
    ('Cutting machine 03',  'কাটিং মেশিন ০৩'),
    ('Pressing machine 01', 'প্রেসিং মেশিন ০১')
  ) as v (name, bn)
  where m.name = v.name;
  get diagnostics v_machines = row_count;

  if v_people <> 5 or v_machines <> 5 then
    raise exception
      'Bangla names not saved: expected 5 people and 5 machines, found % and %.',
      v_people, v_machines;
  end if;
end;
$$;

-- Show the result, so you can read it.
select 'person' as kind, email as english, display_name_bn as bangla
from public.profiles
union all
select 'machine', name, name_bn from public.machines
order by 1, 2;
