# Optional: give each machine a fixed place on the Machine map

- From: mithi
- To: sakib
- Status: done

## What I need
An optional `seat` field on each machine (for example the text `A3`, meaning row A, place 3), sent in `list_machines()` on `Machine` like `code`. It can be `null` when nobody set one. Please add it to `docs/api-contract.md` section 3 too. This is low priority: the MVP works without it.

## Why
The website's Machine map now uses the real backend (machines, reports, assign, and the real `code`). Everything it shows already comes from the backend, except WHERE each machine sits. For now the website sorts machines by name and counts them into rows of six, so adding or renaming one machine can move other machines to a different seat. A fixed `seat` would keep every machine in the same place on the floor map.

## What I am doing meanwhile
The website keeps sorting by name. When `seat` arrives I will use it for the seat position, with no other change for you.

Done (2026-11-07, Sakib): every machine has an optional unique `seat` (A1 to A5 for the 5 machines), in `list_machines()` and inside every report (`machine.seat`). Migration `20261107100000_machine_seats.sql`, contract section 3, 138 database checks and 30 real client checks pass.
