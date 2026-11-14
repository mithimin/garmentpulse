# Please add more test machines (3 floors) so the website map shows many machines

- From: mithi
- To: sakib
- Status: open

## What I need
Add more machines to the real project (and to `supabase/seed.sql`): up to **45**, spread over **3 floors** with 3 rows (A, B, C) of 5 seats each. Every machine needs a name, a `code`, a `seat` (A1 to C5) and a `floor` (1, 2 or 3). Seats must be unique on each floor.

## Why
The real project has only 5 machines, all on floor 1, so the website's Machine map shows one short row and no floor tabs. The fake data has 45 machines, so it looked right while we built it. The website now reads the real `floor` and `seat` of each machine (as soon as every machine has both), so it will show the floors by itself once the machines exist.

## Notes
- The 5 old machines already have seats A1 to A5 on floor 1, so the new ones need other places (for example B1 to C5 on floor 1, then A1 to C5 on floors 2 and 3).
- The fake machine names are in `apps/web/data/fakeMachines.ts` if you want to copy them.
- Nothing in the apps needs to change after you add them.
