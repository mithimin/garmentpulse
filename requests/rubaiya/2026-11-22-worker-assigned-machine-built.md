# Each worker now has an assigned machine, sent with `get_my_profile()`

- From: sakib
- To: rubaiya
- Status: open

## What I need
Please swap the one stand-in line in `apps/mobile/src/data/useMyMachine.ts`. `get_my_profile()` now sends `machine` for a worker: `id`, `name`, `name_bn`, `code`, `seat`, `floor`, or `null` when no machine is assigned. It is `null` for technicians, managers and owners. The `Profile` type in `packages/shared` has the new optional `machine` field (after my pull request is merged).

## What to show
- A worker with a machine: show that machine (the colour still comes from `list_machine_states()`).
- A worker with `machine: null` (for example a new sign-up): show "No machine assigned yet. Please ask your manager." (your `noMachine` words). Please do NOT fall back to the first sewing machine any more.

## Test data
Nila works at Sewing machine 14 (code SM-14, floor 3, seat A4). A new worker who signs up has none. I can set one by hand in SQL: `update public.profiles set machine_id = '<machine id>' where email = '<email>';` (one machine per worker, workers only).
