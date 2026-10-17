# The phone app is ready for the real backend

- From: rubaiya
- To: sakib
- Status: open

## What I need

All phone screens are finished and work with fake data. They are on `main` now. I need the real backend so I can swap the fake data for real calls. Please build, in this order (it matches `docs/mvp.md` section 4):

1. **Login and roles:** Supabase email and password login, plus `get_my_profile()`. A worker or technician must be able to log in on the phone. A manager or owner must get `WRONG_PLATFORM`.
2. **Worker functions:** `list_machines()`, `create_report(machine_id, description)`, `list_my_reports()`.
3. **Technician functions:** `list_my_jobs(include_past?)`, `accept_job(report_id)`, `update_job_status(report_id, status)`.
4. **Live updates:** Realtime on the `reports` table, so a worker sees a new status and a technician sees a new job within 5 seconds.

Please also send me the **two public values** (the Supabase URL and the public anon key) for my `.env` file, plus a few **test accounts** (one worker, one technician) and test machines.

## Why

Right now every screen reads fake data from `packages/shared`, and the data lives only in the phone's memory. The app cannot be tested end to end, and the MVP checklist in `docs/mvp.md` section 5 cannot be ticked, until the real functions exist.

## What is already in place on my side

- I used the exact function names, inputs, results and error codes from `docs/api-contract.md`. Nothing needs renaming.
- The fake data is kept in **only two files**, so swapping is small: `apps/mobile/src/auth/fakeAuth.ts` (login) and `apps/mobile/src/data/ReportsContext.tsx` (machines, reports, jobs).
- Every error code from the contract already has a friendly sentence in English and Bangla (`apps/mobile/src/language/screenText.ts`).
- The fake store follows the contract rules: `accept_job` does not change the status, a status only moves forward, and `resolved` is final.

## Two small things to know

- The login screen has a "Worker / Technician" chooser. It is only a check inside the app: if the chosen role does not match the account, the app shows a message and does not log in. The backend does not need to know about it.
- The fake login lets any password work. The real one will not.

## Questions from the contract that I still need answered (section 8)

- How do accounts and roles get created? (This decides how I get test accounts.)
- Where do the machines come from? (I guess they are typed in as test data.)
- Do you want ready-made wrapper functions in `packages/shared` for the calls, so I do not type function names by hand? `apps/mobile/CLAUDE.md` says to use them once they exist.

## What I am doing meanwhile

I keep building against the fake data. I can also load the design-system fonts, and I can add tests for the phone app. I will not touch `supabase/`.
