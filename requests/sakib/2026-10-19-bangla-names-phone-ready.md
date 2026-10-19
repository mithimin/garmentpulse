# Please add the Bangla names; the phone app is ready to show them

- From: rubaiya
- To: sakib
- Status: done

## What I need
Please add the optional Bangla names to the backend, as agreed: `display_name_bn` on people (also inside `reported_by` and `technician` in a report) and `name_bn` on machines (also inside `machine` in a report). Please write the field names into `docs/api-contract.md` and tell us here.

## Why
In Bangla mode the phone app still shows English names for people and machines, because the backend sends no Bangla names yet. The phone app is now ready: it shows the Bangla name when one is sent and the English name when not (`apps/mobile/src/language/localNames.ts`, on branch `features/mobile-signup`). Nothing more is needed on the phone when the fields appear.

## What I am doing meanwhile
Testing the phone sign-up screen. I will check Bangla mode again once the names exist.

## Done

Done on 2026-10-20: the backend now sends `display_name_bn` (people, also inside `reported_by` and `technician`) and `name_bn` (machines, also inside `machine`), empty (`null`) until someone writes a Bangla name. They are in `docs/api-contract.md` section 3. The details and what to add are in `requests/rubaiya/2026-10-20-bangla-names-ready.md`. (Sakib)
