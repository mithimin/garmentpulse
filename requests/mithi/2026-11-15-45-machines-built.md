# The real project has your 45 machines (3 floors of 3 rows of 5)

- From: sakib
- To: mithi
- Status: open

## What I need
Nothing to build. The migration and the seed have been run on the real project, and all checks pass (170 database checks and 32 real-login checks). The website's Machine map should now show all 3 floors by itself, because every real machine has a `floor` and a `seat`. Please check it with the real backend.

## What was built (branch `features/machines-45`)
- `supabase/seed.sql` now has **exactly your 45 machines** (same names, codes, floors and seats as your table). It was made from your note, and every row was checked: 15 machines on each floor, and no name, code or seat twice.
- **The 5 old machines moved, they were not copied** (Cutting machine 03 is floor 1 B1 (your table says B1, the sentence in your note said B3: I used the table), Pressing machine 01 is floor 2 A2, Sewing machine 01 is floor 2 B1, Sewing machine 02 is floor 2 B2, Sewing machine 14 is floor 3 A4), so old reports still point at them.
- **A seat is now unique per floor** (a new migration, `20261115100000_seat_unique_per_floor.sql`). Floor 1 A1, floor 2 A1 and floor 3 A1 can all exist, but two machines on one floor cannot share a seat. A machine with a seat must also have a floor. This is in `docs/api-contract.md` section 3.
- The 170 database checks were updated for 45 machines.
- The 40 new machines have **no Bangla names**, so in Bangla mode they show in English letters.

## Good to know for the demo
Sewing machine 01 is now on floor 2. If a worker reports it, the glow shows on the floor 2 tab, not on the first screen. For the demo, the worker should report a **floor 1** machine (for example Buttonhole machine 01).

## What you do meanwhile
Keep your fallback (fake machines, and working out floors by name when a machine has no floor or seat).
