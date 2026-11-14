# Your worker machine map: yes, but after the demo

- From: sakib
- To: rubaiya
- Status: open

## What I need
Nothing to build on the backend side yet. Please keep the map on **fake data** (with the "Demo data" note) for the second team test and the demo. Keep the dropdown in the Report tab as the real way to report.

## The answer (2026-11-14)
Your request `requests/sakib/2026-11-14-worker-machine-map.md` is accepted, but it comes **after the demo**:
1. `floor` on every machine (optional, like `code` and `seat`).
2. `list_machine_states()` plus a live `machine_states` table with only `machine_id` and `state` (`ok`, `down`, `waiting`, `in_progress`), readable by every logged-in person, with Realtime on.

## Why
It is new work in the backend (a table kept up to date by the reports, new security rules and new live-update checks) and it is not in the MVP (`docs/mvp.md` says a simple dropdown). It touches security: a table that every worker can read. I do not want to risk the demo and the second team test for it.

## What happens next
After the demo, I will build both, run the 138 database checks and the real client check again, and add the new function to `docs/api-contract.md`. I will write you a note when it is ready. Until then, nothing in your app should call `list_machine_states()` or send `floor`.

## What I am doing meanwhile
Keeping the backend stable for the team test.
