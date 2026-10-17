# STATUS: Backend, shared toolbox and docs (`supabase/`, `packages/shared/`, `docs/`)

**Owner: Sakib.** Only Sakib's sessions change this file.

This is the "where are we?" page for the backend and the shared toolbox. The root `CLAUDE.md` loads it into **every** teammate's Claude, so keep it short, true, and in simple words. **Update it before you finish each piece of work.**

**Last updated:** 2026-10-18 by Sakib (contract confirmed)

## Done

- Project scaffold, checks (`npm run check`) and the GitHub robot (CI).
- `docs/api-contract.md` v1 is confirmed by Sakib and built (Rubaiya and Mithi still review it; see its section 8).
- `packages/shared` has: data shapes, error codes, a **draft** English/Bangla word list (`labels.ts`), helper rules (`helpers.ts`), and fake data (`fixtures.ts`).
- **The real backend is built and tested** in a Supabase cloud project (written as migration files in `supabase/migrations/`):
  - Tables: `profiles`, `machines`, `reports`. All locked by default (Row Level Security).
  - Security rules: who may see which report; live updates (Realtime) switched on for `reports`.
  - **All 12 functions from `docs/api-contract.md`** with the exact names, inputs and error codes: `get_my_profile`, `list_machines`, `create_report`, `list_my_reports`, `list_reports`, `get_report`, `list_technicians`, `assign_technician`, `list_my_jobs`, `accept_job`, `update_job_status`, `get_owner_summary`.
  - Test data in `supabase/seed.sql`: 5 people, 5 machines, 4 reports.
  - A rules check in `supabase/tests/api_rules_check.sql` (run by hand in the SQL Editor). Last run: **all 46 checks passed**.
- **Ready-made wrappers** in `packages/shared/src/api.ts`: `createApi(supabase)` gives typed methods for all 12 functions (for example `api.listMyReports()`). Failures become an `ApiError` with a known `code`. Both apps should use these instead of typing `supabase.rpc('...')` by hand.

## In progress

- Nothing right now.

## Next

1. Wait for Rubaiya and Mithi to confirm a real test login works (the URL, key and passwords were sent privately). This starts shared step ★4.
2. Check live updates (the 5-second rule) with two screens open.
3. Postman collection, so the apps can be checked against the real backend.
4. Agree the Bangla words in `packages/shared/src/labels.ts` with the team.
5. Later: sign-up with one-time manager codes (Mithi's idea, see `requests/sakib/2026-10-18-signup-and-manager-code.md`).

## Waiting on someone else

- Rubaiya and Mithi: switch their apps to the real backend and confirm a login works.
- The team's review of the API contract and the Bangla words.

## Decisions made in this lane

- Accounts and roles are created by hand by Sakib in the Supabase dashboard (MVP). No sign-up screen. Sign-up with one-time manager codes is **later** (decided 2026-10-18), so the owner stays read-only.
- Machines are typed in as test data (`seed.sql`). No function to add machines in the MVP.
- The owner uses the **Web** app (as in the contract).
- A manager cannot reassign a report in the MVP.
- `reports` holds the technician and `accepted_at` directly. There is no separate assignments table.
- A technician can have only one unfinished job at a time. This is a database rule, so no app can break it.
- `update_job_status` allows any forward move (`waiting` to `in_progress` to `resolved`, and also straight to `resolved` once accepted). Backwards and repeats are rejected.

## Good to know for the other lanes

- Fake data for screens lives in `packages/shared/src/fixtures.ts`. Use it until you switch to the real backend.
- Call the real backend with `createApi(supabase)` from `@garmentpulse/shared` (see `packages/shared/src/api.ts`). Under the hood it uses `supabase.rpc(...)`. Every error becomes an `ApiError` whose `code` is a capital-letter code from the contract.
- The 5 test people use `@example.com` emails (`nila`, `tariq`, `hasan`, `farhan`, `owner`). Their passwords are shared privately, not in git.
- Local running with Docker is not set up yet. The backend currently lives in the cloud project only.
