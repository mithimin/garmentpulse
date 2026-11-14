-- =============================================================================
-- Fill in the Bangla names of the 5 test people and the 45 machines
-- (run by hand in the Supabase SQL Editor)
-- =============================================================================
-- What this file does, in plain words:
--   The Bangla name columns (profiles.display_name_bn and machines.name_bn)
--   start EMPTY. In Bangla mode the apps then show the English-letter name.
--   This file writes the Bangla spelling of the 5 test people and the 45 machines, so
--   Bangla mode shows them in Bangla letters on the phone app and on the website.
--
-- Where the spellings come from:
--   Nothing is translated automatically. The team first wrote a draft, and a
--   Bangla speaker read it (docs/bangla-review-sheet.md, Part B). On 2026-10-21 all ten
--   were said to be OK; on 2026-11-02 a second read changed the owner's name to
--   "রহমান সাহেব".
--   The 40 machines that were added later follow the SAME pattern as the 5 reviewed ones:
--   the type word, the word মেশিন and the number in Bangla digits. The type words
--   সেলাই (Sewing), কাটিং (Cutting) and প্রেসিং (Pressing) were reviewed on 2026-10-21;
--   হোল (Buttonhole) and ওভারলক (Overlock) were confirmed by the Bangla speaker on
--   2026-11-15.
--
-- WHEN TO RUN IT (important):
--   Run it AFTER supabase/tests/api_rules_check.sql, never before. That check
--   expects the Bangla names to be empty. The usual order is:
--     reset_demo_data.sql -> seed.sql -> api_rules_check.sql -> THIS FILE
--   reset_demo_data.sql empties these names again, so the next round of checks
--   starts clean. Running THIS file again is safe: it writes the same words.
--
-- SAFETY: it only changes the Bangla name of the 5 test people and the 45 machines.
-- It refuses to finish (and changes nothing) unless it finds exactly 5 people and
-- 45 machines.
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
    ('owner@example.com',  'রহমান সাহেব')
  ) as v (email, bn)
  where p.email = v.email;
  get diagnostics v_people = row_count;

  update public.machines m
  set name_bn = v.bn
  from (values
    ('Buttonhole machine 01', 'হোল মেশিন ০১'),
    ('Buttonhole machine 02', 'হোল মেশিন ০২'),
    ('Buttonhole machine 03', 'হোল মেশিন ০৩'),
    ('Cutting machine 01', 'কাটিং মেশিন ০১'),
    ('Cutting machine 02', 'কাটিং মেশিন ০২'),
    ('Cutting machine 03', 'কাটিং মেশিন ০৩'),
    ('Cutting machine 04', 'কাটিং মেশিন ০৪'),
    ('Cutting machine 05', 'কাটিং মেশিন ০৫'),
    ('Overlock machine 01', 'ওভারলক মেশিন ০১'),
    ('Overlock machine 02', 'ওভারলক মেশিন ০২'),
    ('Overlock machine 03', 'ওভারলক মেশিন ০৩'),
    ('Overlock machine 04', 'ওভারলক মেশিন ০৪'),
    ('Overlock machine 05', 'ওভারলক মেশিন ০৫'),
    ('Overlock machine 06', 'ওভারলক মেশিন ০৬'),
    ('Overlock machine 07', 'ওভারলক মেশিন ০৭'),
    ('Overlock machine 08', 'ওভারলক মেশিন ০৮'),
    ('Pressing machine 01', 'প্রেসিং মেশিন ০১'),
    ('Pressing machine 02', 'প্রেসিং মেশিন ০২'),
    ('Pressing machine 03', 'প্রেসিং মেশিন ০৩'),
    ('Pressing machine 04', 'প্রেসিং মেশিন ০৪'),
    ('Sewing machine 01', 'সেলাই মেশিন ০১'),
    ('Sewing machine 02', 'সেলাই মেশিন ০২'),
    ('Sewing machine 03', 'সেলাই মেশিন ০৩'),
    ('Sewing machine 04', 'সেলাই মেশিন ০৪'),
    ('Sewing machine 05', 'সেলাই মেশিন ০৫'),
    ('Sewing machine 06', 'সেলাই মেশিন ০৬'),
    ('Sewing machine 07', 'সেলাই মেশিন ০৭'),
    ('Sewing machine 08', 'সেলাই মেশিন ০৮'),
    ('Sewing machine 09', 'সেলাই মেশিন ০৯'),
    ('Sewing machine 10', 'সেলাই মেশিন ১০'),
    ('Sewing machine 11', 'সেলাই মেশিন ১১'),
    ('Sewing machine 12', 'সেলাই মেশিন ১২'),
    ('Sewing machine 13', 'সেলাই মেশিন ১৩'),
    ('Sewing machine 14', 'সেলাই মেশিন ১৪'),
    ('Sewing machine 15', 'সেলাই মেশিন ১৫'),
    ('Sewing machine 16', 'সেলাই মেশিন ১৬'),
    ('Sewing machine 17', 'সেলাই মেশিন ১৭'),
    ('Sewing machine 18', 'সেলাই মেশিন ১৮'),
    ('Sewing machine 19', 'সেলাই মেশিন ১৯'),
    ('Sewing machine 20', 'সেলাই মেশিন ২০'),
    ('Sewing machine 21', 'সেলাই মেশিন ২১'),
    ('Sewing machine 22', 'সেলাই মেশিন ২২'),
    ('Sewing machine 23', 'সেলাই মেশিন ২৩'),
    ('Sewing machine 24', 'সেলাই মেশিন ২৪'),
    ('Sewing machine 25', 'সেলাই মেশিন ২৫')
  ) as v (name, bn)
  where m.name = v.name;
  get diagnostics v_machines = row_count;

  if v_people <> 5 or v_machines <> 45 then
    raise exception
      'Bangla names not saved: expected 5 people and 45 machines, found % and %.',
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
