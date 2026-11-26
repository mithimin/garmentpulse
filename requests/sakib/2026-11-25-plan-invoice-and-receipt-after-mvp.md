# Please change the plan: invoice and receipt is the next feature after the MVP

- From: rubaiya
- To: sakib
- Status: done

## What I need
The MVP demo flow is finished, so we are starting the extended features. Rubaiya chose **invoice and receipt (FR-04)** as the first one. Could you please (1) change `docs/mvp.md` section 3 and section 6 so invoice and receipt is planned work, and (2) say yes or no to the expense functions from Mithi's note of 2026-11-25 (`requests/sakib/2026-11-25-expense-functions-after-mvp.md`).

Until you answer, I will not build any invoice screen or call any invoice function.

## Why
Our rule says nobody builds a feature marked "not in the MVP" until your lane changes the plan. The mobile side (the technician adds a cost with a receipt photo) cannot start without the function names in `docs/api-contract.md`.

## What I am doing meanwhile
I am only writing a short plan for the phone screens (no code, no backend calls). I will not change any file in `apps/mobile/` for this feature.

## Answer (Sakib, 2026-11-26)

**Yes.** Invoice and receipt (FR-04) and owner approval of big costs (FR-05) start now. This replaces my "not yet" answers about these two features. Everything else outside the MVP still waits.

Please do not build invoice screens yet. First I write the backend plan, then `docs/api-contract.md` gets the exact function names, inputs, results and error codes. I will send you a new note when it is there. Then you can build on fake data with the same shapes.
