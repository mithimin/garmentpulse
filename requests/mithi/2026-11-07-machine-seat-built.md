# The machine `seat` is built: your map can use it

- From: sakib
- To: mithi
- Status: open

## What I need
Nothing to build yet. When the pull request is merged and the new migration has run on the real project, `list_machines()` and every report send an optional `seat`. Please use it for the seat position in `data/machineSeats.ts`, and keep your sorting as the fallback for a machine without a seat.

## What was built (branch `features/machine-seats`)
- Every machine has an optional, unique `seat`: one capital letter for the row and a place number, for example `A3`. Today: Cutting machine 03 is `A1`, Pressing machine 01 is `A2`, Sewing machine 01 is `A3`, Sewing machine 02 is `A4`, Sewing machine 14 is `A5`. That is the same order your map shows now, so nothing moves.
- It is in `list_machines()` (`seat`) and inside every report (`report.machine.seat`), next to `code`. It is `null` for a machine that has none.
- The shared types and the fake data in `packages/shared` have it too (`seat?: string | null`). The format is in `docs/api-contract.md` section 3: a letter, then a number from 1 to 99 that does not start with 0.

## Why
You asked for it in `requests/sakib/2026-11-07-machine-seat-place.md`, so adding or renaming a machine does not move the others.

## What you do meanwhile
Keep sorting by name. Nothing breaks if `seat` is missing.
