# STATUS: Backend, shared toolbox and docs (`supabase/`, `packages/shared/`, `docs/`)

**Owner: Sakib.** Only Sakib's sessions change this file.

This is the "where are we?" page for the backend and the shared toolbox. The root `CLAUDE.md` loads it into **every** teammate's Claude, so keep it short, true, and in simple words. **Update it before you finish each piece of work.**

**Last updated:** 2026-10-26 by Sakib (first team test done, fix notes sent)

## Done

- Project scaffold, checks (`npm run check`) and the GitHub robot (CI).
- `docs/api-contract.md` v1 is confirmed by Sakib and built (Rubaiya and Mithi still review it; see its section 8).
- `packages/shared` has: data shapes, error codes, a **draft** English/Bangla word list (`labels.ts`), helper rules (`helpers.ts`), and fake data (`fixtures.ts`).
- **The real backend is built and tested** in a Supabase cloud project (written as migration files in `supabase/migrations/`):
  - Tables: `profiles`, `machines`, `reports`. All locked by default (Row Level Security).
  - Security rules: who may see which report; live updates (Realtime) switched on for `reports`.
  - **All 12 functions from `docs/api-contract.md`** with the exact names, inputs and error codes: `get_my_profile`, `list_machines`, `create_report`, `list_my_reports`, `list_reports`, `get_report`, `list_technicians`, `assign_technician`, `list_my_jobs`, `accept_job`, `update_job_status`, `get_owner_summary`.
  - Test data in `supabase/seed.sql`: 5 people, 5 machines, 4 reports.
  - A rules check in `supabase/tests/api_rules_check.sql` (run by hand in the SQL Editor). It has **126 checks** and all pass: 49 for the reports flow, 26 for the invite code functions, 26 for the sign-up guard, and 25 for the Bangla names. It expects the clean seed data, so run `supabase/reset_demo_data.sql` (it clears reports **and** leftover invite codes) and then `supabase/seed.sql` first; reports or unused codes made by hand change the counts.
  - A **real client check** (`supabase/tests/real_client.check.ts`, started with `node supabase/tests/run_real_check.mjs`): it logs in like the real apps and calls everything through `createApi`. Last run (2026-10-21): **all 30 checks passed** (16 for logins, roles and live updates, plus 12 for sign-up with invite codes). A new report reached the manager in about **0.5 seconds** (the rule is 5), and an unrelated technician did not receive it. Once, a run showed no live updates at all and the next run was fine again, so a hiccup on Supabase's side is possible. Each run leaves one report and a few pretend sign-ups; the run prints the lines that delete them.
  - A bug found by that check and fixed: any worker or technician could open a report that was still in the queue. See migration `20261018100000_fix_get_report_queue.sql`.
  - **Sign-up with invite codes: the backend part is built and tested** (migrations `20261019100000` to `20261019120000`): the locked `invite_codes` table; `create_invite_code`, `list_invite_codes` and `check_invite_code` (the last one also works before login); and a **sign-up guard** on the login list. A new account is accepted only with a good invite code (the role comes from the code, never from the person) or with an email that Sakib pre-approved in the locked `approved_accounts` table (owner and test accounts; see `supabase/approve_test_accounts.sql`). Anything else is refused and no account is created.
  - Public sign-up is now switched **ON** in the cloud project (a dashboard setting, not in any file), with email confirmation **off**. The guard refuses anyone without a good code. If the project is ever rebuilt, set it by hand: Authentication, Email, sign-up on, confirm email off.
  - **Creating a login by hand in the dashboard now needs the email on the approved list first** (the guard applies to everybody).
- **Bangla names (backend part built 2026-10-20):** the optional columns `profiles.display_name_bn`, `machines.name_bn` and `approved_accounts.display_name_bn` (empty until someone writes one). They travel in every report (`machine.name_bn`, `reported_by.display_name_bn`, `technician.display_name_bn`), the profile, the machine list and the technician list; `null` means the apps show the English name. The sign-up guard saves an optional `display_name_bn` typed at sign-up (trimmed, empty means none, over 80 letters is refused), and `signUpWithCode` accepts `fullNameBn`. Nothing is translated automatically. The shared types have the optional fields. The rules check now has **126 checks** (25 new for Bangla names and the guard) and all pass.
- **Ready-made wrappers** in `packages/shared/src/api.ts`: `createApi(supabase)` gives typed methods for all 12 functions (for example `api.listMyReports()`). Failures become an `ApiError` with a known `code`. Both apps should use these instead of typing `supabase.rpc('...')` by hand.
- **Sign-up helper** (tested with a pretend client **and proven against the real login service**: 12 real sign-up checks passed on 2026-10-19): `createApi(...)` now also has `checkInviteCode`, `createInviteCode` and `listInviteCodes`, and `packages/shared` exports `signUpWithCode(client, { platform, fullName, email, password, code })`. It checks the code, refuses the wrong app (`WRONG_PLATFORM`), signs up, and returns the new person's profile. The two sign-up error codes `INVALID_CODE` and `EMAIL_TAKEN` are in their **own** list (`SIGN_UP_ERROR_CODES`, read with `getApiErrorCode`), so neither app's sentence table breaks. They join the main list once both apps have their sentences.

## In progress

- Nothing right now.

## Next

Both apps are now connected to the real backend (phone: #25, website: #18 and #20). Real logins work, and the **5-second rule is confirmed with real devices** (2026-10-18, per `apps/web/STATUS.md`: the manager page went from 7 to 9 reports without a refresh).

1. **Connect the sign-up screens** (Rubaiya: phone sign-up; Mithi: website sign-up and the owner and manager code pages). The backend side is finished and proven; they plug in `signUpWithCode`, `createInviteCode` and `listInviteCodes` (see `requests/rubaiya/2026-10-19-signup-is-ready.md` and `requests/mithi/2026-10-19-signup-is-ready.md`). Rubaiya also needs sentences for `INVALID_CODE` and `EMAIL_TAKEN`. Later, the two sign-up error codes join `ERROR_CODES` once both apps have their sentences.
2. **The full two-screen test** (shared step ★5): a worker reports, the manager sees it, assigns a free technician, the technician accepts and finishes, the owner sees the counts. Also the "typing the address" test: a worker must be refused on manager and owner pages. Still untested on the real backend: the website's Assign button and the owner screen with live updates.
3. DONE (2026-10-21): the Bangla names of the 10 test values were read by a Bangla speaker (Parts A to C of `docs/bangla-review-sheet.md` are OK) and filled in with `supabase/fill_bangla_test_names.sql`. Run it **after** `api_rules_check.sql`; `reset_demo_data.sql` empties the names again so the checks start clean.
4. Parts D and E of the Bangla sheet (the phone and website texts) still need a Bangla speaker. The 9 shared words in `labels.ts` are confirmed OK.
5. Postman collection (optional now that the real client check exists).

## Waiting on someone else

- First team test (2026-10-26) found 5 small problems, none in the backend. Rubaiya: log out lands on the sign-up page, and the sign-up screen has no Worker / Technician choice. Mithi: newest report not on top, colour of the all-busy message, and owner and manager cannot share one browser login. Notes are in `requests/rubaiya/` and `requests/mithi/` (2026-10-26). Then: a short second team test.
- Rubaiya and Mithi: connect their sign-up screens and code pages to the real backend.
- The full two-screen test needs Rubaiya (phone) and Mithi (website) at the same time.
- A Bangla speaker: Bangla spellings of the test people and machines, and a read of the Bangla words.
- The team's review of the API contract.

## Decisions made in this lane

- **Sign-up is in the MVP, with invite codes** (decided 2026-10-19; it replaces the "later" decision of 2026-10-18). The owner makes **manager** codes; a manager makes **worker** and **technician** codes. The code decides the role, works once, expires after 7 days, and there is no email confirmation. It is enforced by a guard in the database at sign-up, and `check_invite_code` lets the apps ask first. **Owner** accounts are never made by sign-up; Sakib makes them by hand. The owner now has two pages (Reports, Manager codes) and makes manager codes, which is the owner's only action that changes anything.
- Machines are typed in as test data (`seed.sql`). No function to add machines in the MVP.
- **Bangla names are never generated; a person types them** (decided 2026-10-19). For the 5 test people and 5 machines, a Bangla speaker writes the spellings (Part B of `docs/bangla-review-sheet.md`) and Sakib adds them by hand to the new optional columns `display_name_bn` (people) and `name_bn` (machines). For real users later: an **optional second box at sign-up**, "Your name in Bangla"; the sign-up guard saves it as `display_name_bn`. If it is empty, Bangla mode shows the English-letter name. Machines get their Bangla name from Sakib when he adds them. **Built on 2026-10-20** (migrations `20261020100000` and `20261020110000`, field names in `docs/api-contract.md` section 3, 126 database checks pass). Rubaiya and Mithi each add the optional box to their sign-up form (`fullNameBn` in `signUpWithCode`).
- The owner uses the **Web** app (as in the contract).
- A manager cannot reassign a report in the MVP.
- `reports` holds the technician and `accepted_at` directly. There is no separate assignments table.
- A technician can have only one unfinished job at a time. This is a database rule, so no app can break it.
- `update_job_status` allows any forward move (`waiting` to `in_progress` to `resolved`, and also straight to `resolved` once accepted). Backwards and repeats are rejected.

## Good to know for the other lanes

- Fake data for screens lives in `packages/shared/src/fixtures.ts`. Use it until you switch to the real backend.
- Call the real backend with `createApi(supabase)` from `@garmentpulse/shared` (see `packages/shared/src/api.ts`). Under the hood it uses `supabase.rpc(...)`. Every error becomes an `ApiError` whose `code` is a capital-letter code from the contract.
- **Live updates need the login on the connection.** In our real client check, a listener only received changes after we gave its connection the person's login with `await supabase.realtime.setAuth(session.access_token)` before subscribing. Do the same in the apps right after a person logs in, then test with two screens. See the notes in `requests/rubaiya/` and `requests/mithi/`.
- You can run the real client check yourself with `node supabase/tests/run_real_check.mjs` (it asks for the test passwords and shows `*`). It leaves one waiting report each run; ask Sakib to remove it.
- The 5 test people use `@example.com` emails (`nila`, `tariq`, `hasan`, `farhan`, `owner`). Their passwords are shared privately, not in git.
- Local running with Docker is not set up yet. The backend currently lives in the cloud project only.
