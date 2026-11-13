# Floors and rows for machines, and a live colour for every machine (worker machine map)

- From: rubaiya
- To: sakib
- Status: open

## What I need
Two small things in the backend, so the phone app can show a **machine map** on the worker's Home screen:

1. **A floor and a row for every machine.** Today a machine only has `name`, `name_bn`, `code` and `seat` (like `A3`). The map needs a **floor number** (1, 2, 3 ...) and a **row letter** (A, B, C ...) plus the **place number** in the row. Please add an optional `floor` (a whole number) to machines and send it in `list_machines()` and in `machine` inside every report, like `code` and `seat`. If you prefer, `seat` can stay the row letter and place number (`A3` = row A, place 3), and only `floor` is new.
2. **One function every worker can call to see the live state of every machine**, for example `list_machine_states()`. A worker cannot read other people's reports today (the security rules), so the map cannot know that a machine on floor 2 is already down. It should return one row per machine:
   - `machine_id`
   - `state`: one of `ok`, `down`, `waiting`, `in_progress`
   and **nothing else** (no report text, no names), so no private information leaks.
   The four states I use on the map:
   - `ok` = the machine has no open report;
   - `down` = it has a report that is `waiting` and **has no technician yet** (the queue);
   - `waiting` = a technician is **assigned** but has not started (status still `waiting`, `technician` set);
   - `in_progress` = status `in_progress`.
   A resolved report means `ok` again.
   It also needs **live updates**: a new report or a status change must reach every worker's map within 5 seconds, like the manager's list does now. (For example a small locked table or view, `machine_states`, readable by every logged-in person, with Realtime switched on.)

## Why
Rubaiya's new Home screen for workers shows floors, rows and machines as coloured seats (cream = OK, dark brown glowing = down with a beep, butter yellow = waiting, sky blue = in progress). A worker taps a machine on the map to report it. Without the floor and the live states, the map can only show made-up data.

Note: this map is **new** and is not written in `docs/mvp.md` (the MVP says "a simple dropdown"). The dropdown form stays in the Report tab. Please add the new function to `docs/api-contract.md` if you accept it, and tell the team.

## What I am doing meanwhile
The map is built with **fake floors, rows, machines and states** inside the phone app (`apps/mobile/src/data/fakeMachineMap.ts`), with a clear "Demo data" note on the card. Sending a report from the map does not make a real report yet. When your two things exist, I replace the fake data with the real calls, and send the real `create_report` with the tapped machine's id.
