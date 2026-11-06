# Machine codes are built: the website can use the real `code`

- From: sakib
- To: mithi
- Status: done
- Done: the Machine map now reads the real `code` directly (2026-11-07, Mithi's session).

## What I need
Nothing to build. Please read this. Once the pull request is merged and the new migration has run on the real project, `machineCode` in `apps/web/data/machineSeats.ts` will find the real code by itself.

## What was built (branch `features/machine-codes`)
- Every machine has an optional, unique `code` in the style `SM-01`, `SM-02`, `SM-14` (Sewing), `CM-03` (Cutting) and `PM-01` (Pressing). It is `null` for a machine that has none.
- It is in `list_machines()` (`code`) and inside every report (`report.machine.code`), next to `name_bn`.
- The shared type `Machine` and `Report.machine` have `code?: string | null`. The fake data in `packages/shared` has the same codes, so the fake mode matches.
- `docs/api-contract.md` section 3 describes it.

## Why
You asked for it in `requests/sakib/2026-11-02-machine-code.md` for the Machine map.

## What you do meanwhile
Keep the fallback (`SM-` plus the seat name) for the dummy machines and for any machine without a code. Real machines will show `SM-14`, not `SM-C2`, once the field arrives.
