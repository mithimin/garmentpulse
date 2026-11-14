# Please make the real machines and floors match the website's fake machines

- From: mithi
- To: sakib
- Status: done

## What I need
Make the real project's machines **exactly the same** as the 45 fake machines on the website: the same names, codes, floors and seats, listed in the table below. Please update `supabase/seed.sql` and the real project.

## Why
The real project has only 5 machines, all on floor 1, so the website's Machine map shows one short row and no floor tabs. The website now reads the real `floor` and `seat` of every machine (once every machine has both), so it will show the 3 floors by itself when the real machines match this table.

## Notes
- 3 floors, each with 3 rows (A, B, C) of 5 seats. Names are sorted the way the fake map sorts them.
- **The 5 machines you already have move.** For example `Cutting machine 03` is now floor 1 seat B3 (it was A1), `Pressing machine 01` is floor 2 seat A1 (it was A2 on floor 1), and the three sewing machines (01, 02, 14) move to floor 2 and 3. Please change their `seat` and `floor` instead of adding copies, so old reports keep pointing at them. Seats are unique, so move them in an order that never puts two machines in one place.
- The source is `apps/web/data/fakeMachines.ts` (same file, same order).
- Nothing in the apps needs to change after this.

## The 45 machines

| Floor | Seat | Name | Code |
|---|---|---|---|
| 1 | A1 | Buttonhole machine 01 | BH-01 |
| 1 | A2 | Buttonhole machine 02 | BH-02 |
| 1 | A3 | Buttonhole machine 03 | BH-03 |
| 1 | A4 | Cutting machine 01 | CM-01 |
| 1 | A5 | Cutting machine 02 | CM-02 |
| 1 | B1 | Cutting machine 03 | CM-03 |
| 1 | B2 | Cutting machine 04 | CM-04 |
| 1 | B3 | Cutting machine 05 | CM-05 |
| 1 | B4 | Overlock machine 01 | OL-01 |
| 1 | B5 | Overlock machine 02 | OL-02 |
| 1 | C1 | Overlock machine 03 | OL-03 |
| 1 | C2 | Overlock machine 04 | OL-04 |
| 1 | C3 | Overlock machine 05 | OL-05 |
| 1 | C4 | Overlock machine 06 | OL-06 |
| 1 | C5 | Overlock machine 07 | OL-07 |
| 2 | A1 | Overlock machine 08 | OL-08 |
| 2 | A2 | Pressing machine 01 | PM-01 |
| 2 | A3 | Pressing machine 02 | PM-02 |
| 2 | A4 | Pressing machine 03 | PM-03 |
| 2 | A5 | Pressing machine 04 | PM-04 |
| 2 | B1 | Sewing machine 01 | SM-01 |
| 2 | B2 | Sewing machine 02 | SM-02 |
| 2 | B3 | Sewing machine 03 | SM-03 |
| 2 | B4 | Sewing machine 04 | SM-04 |
| 2 | B5 | Sewing machine 05 | SM-05 |
| 2 | C1 | Sewing machine 06 | SM-06 |
| 2 | C2 | Sewing machine 07 | SM-07 |
| 2 | C3 | Sewing machine 08 | SM-08 |
| 2 | C4 | Sewing machine 09 | SM-09 |
| 2 | C5 | Sewing machine 10 | SM-10 |
| 3 | A1 | Sewing machine 11 | SM-11 |
| 3 | A2 | Sewing machine 12 | SM-12 |
| 3 | A3 | Sewing machine 13 | SM-13 |
| 3 | A4 | Sewing machine 14 | SM-14 |
| 3 | A5 | Sewing machine 15 | SM-15 |
| 3 | B1 | Sewing machine 16 | SM-16 |
| 3 | B2 | Sewing machine 17 | SM-17 |
| 3 | B3 | Sewing machine 18 | SM-18 |
| 3 | B4 | Sewing machine 19 | SM-19 |
| 3 | B5 | Sewing machine 20 | SM-20 |
| 3 | C1 | Sewing machine 21 | SM-21 |
| 3 | C2 | Sewing machine 22 | SM-22 |
| 3 | C3 | Sewing machine 23 | SM-23 |
| 3 | C4 | Sewing machine 24 | SM-24 |
| 3 | C5 | Sewing machine 25 | SM-25 |

Done (2026-11-15, Sakib): the real project has exactly your 45 machines (3 floors of 3 rows of 5 seats), with the same names, codes, floors and seats as your table. The 5 old machines moved, they were not copied. A seat is now unique per floor (migration `20261115100000_seat_unique_per_floor.sql`). 170 database checks and 32 real client checks pass. Pull request 91.
