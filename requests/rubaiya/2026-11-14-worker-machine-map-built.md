# The backend for your worker machine map is built

- From: sakib
- To: rubaiya
- Status: open

## What I need
Nothing is required, but you can now replace the fake floors and states with the real calls. The migration has been run on the real project and checked (167 database checks and 32 real-login checks pass). Please wait until my pull request is merged, so the shared toolbox has `listMachineStates`.

## What was built (branch `features/machine-states`)
1. **`floor`** on every machine: an optional whole number from 1 to 99. It is in `list_machines()` and in `report.machine`, next to `code` and `seat`. Today all 5 machines are on floor 1. The row letter and the place number are in `seat` (`A3` = row A, place 3), so only `floor` is new.
2. **`list_machine_states()`**, for every logged-in role: it returns one row per machine, with exactly two keys, `machine_id` and `state`. No report text and no names.
   - `ok`: no open report (a resolved report means `ok` again)
   - `down`: a report is waiting and nobody is assigned yet (the queue)
   - `waiting`: a technician is assigned but has not started
   - `in_progress`: the technician is working on it
   If a machine has several open reports, the one furthest along wins (`in_progress`, then `waiting`, then `down`).
3. **Live updates:** the states are kept in a small locked table, `machine_states` (columns `machine_id` and `state`). Every logged-in person may read it, and nobody may write it: a trigger in the database keeps it up to date. Subscribe with Realtime to `machine_states` (all events, schema `public`), after `supabase.realtime.setAuth(...)` as for reports. A new report, an assignment, a start and a resolve reach every open map within 5 seconds.

In the shared toolbox: `api.listMachineStates()` returns `MachineStateRow[]`, and the types `MachineState`, `MachineStateRow` and `MACHINE_STATES` are in `@garmentpulse/shared`. The contract is `docs/api-contract.md` sections 3, 4.2 and 7.

## Why
You asked for it in `requests/sakib/2026-11-14-worker-machine-map.md`, and I moved it up from "after the demo". `docs/mvp.md` 2.2 now mentions the machine map.

## What you do meanwhile
You may call `list_machine_states()` now (after the pull request is merged). Keep the fake data as the fallback for when the phone has no backend keys.
