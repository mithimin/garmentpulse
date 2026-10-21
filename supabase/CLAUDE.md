# CLAUDE.md for `supabase/` (the backend)

This file is read when a session works inside `supabase/`. It adds to the root [`CLAUDE.md`](../CLAUDE.md), it does not replace it. **The root rules (simple language, lanes, git rules) still apply here.**

## Whose folder is this?

- **Owner of this folder: Sakib.** Only Sakib's sessions change files here.
- If you are working for Rubaiya or Mithi, you may **read** this folder but must **not change** it. If their app needs something from the backend, they write a short, plain note in `requests/sakib/` (layout in `requests/README.md`).
- Not sure who you are working for? Read `CLAUDE.local.md` in the top folder, or ask.

## What this folder is

The **backend** is the hidden part of GarmentPulse that stores information and enforces the rules. It runs on Supabase (login, a Postgres database, and live updates). Both apps talk to it.

**Big idea: the database is the security guard.** The apps are only screens. Every rule that matters is enforced here, so a changed app cannot cheat. For example: a worker must not be able to do a manager's job, even by trying.

## Layout

| Where | What is in it |
|---|---|
| `migrations/` | Database changes, one new file per change, in order (tables, security rules, functions, the sign-up guard, Bangla names). The newest file is the last change. |
| `tests/` | `api_rules_check.sql` (126 checks, run by hand in the SQL Editor) and `real_client.check.ts` with its starter `run_real_check.mjs` (30 checks through the real login service, run in a terminal) |
| `seed.sql` | The test story: 5 people, 5 machines, 4 reports |
| `approve_test_accounts.sql` | Puts the 5 test emails on the approved list, so their logins can be created by hand (see the sign-up guard rule below) |
| `reset_demo_data.sql` | Deletes all reports and all invite codes and empties the Bangla names, so the checks and the demo start clean. It refuses to run if any account is not an `@example.com` test account. |
| `fill_bangla_test_names.sql` | Writes the reviewed Bangla names of the 5 test people and 5 machines. Run it **after** the rules check (which expects them empty), before the demo. |
| `functions/` | Edge Functions (small server programs). Empty on purpose: not needed in the MVP; the chatbot and camera alerts will use them later |

## Read before you build

| Need | Read |
|---|---|
| Product rules (the PRD always wins) | [`docs/prd.md`](../docs/prd.md) and [`docs/mvp.md`](../docs/mvp.md) |
| Technology, who gets which app, quality rules | [`docs/architecture.md`](../docs/architecture.md) |
| The promise to the apps: function names, inputs, results, error codes | [`docs/api-contract.md`](../docs/api-contract.md) |

## Backend rules

- At the start of a session, follow the start checklist in the root `CLAUDE.md`, and read `requests/sakib/` for open notes from Rubaiya and Mithi. Before you finish, update [`STATUS.md`](./STATUS.md) in this folder.
- `packages/shared/` and `docs/` are shared areas (nobody's lane), so give the clash warning from the root `CLAUDE.md` before changing them. Keep `src/types.ts`, `src/errors.ts` and `src/labels.ts` in step with `docs/api-contract.md`, and keep the fake data in `src/fixtures.ts` realistic.
- **Never edit an old migration.** Every change is a **new** migration file.
- **Row Level Security (a lock on each table row) is on for every table.** A new table without it is a bug.
- **Apps never write tables directly.** Important changes happen only through functions that check permissions and run in one step.
- **Every function must match `docs/api-contract.md` exactly:** same name, same inputs, same result shape, same error codes. Errors use the capital-letter code as the message.
- **Roles are checked on the server** (architecture NFR-02). Never trust a role sent by an app.
- **Never put the service-role key in an app or in git.** It is secret. The apps only get the public anon key.
- **Run both checks before and after every backend change.** First clean the data (`reset_demo_data.sql`, then `seed.sql`), then run `api_rules_check.sql` (it must say ALL ... CHECKS PASSED) and `node supabase/tests/run_real_check.mjs`. Add a check for every new rule. The real client check replaces a Postman collection, which is optional.
- **The sign-up guard applies to everybody.** A new login is accepted only with a good invite code (the role comes from the code, never from the person) or with an email on `approved_accounts`. Creating a login by hand in the dashboard needs that email on the list first.
- **Watch out for empty values in SQL.** Comparing an empty value (NULL) with something is neither true nor false, so a permission check can silently let people in. Use `coalesce(...)` or `is distinct from` (this caused the `get_report` bug for reports still in the queue).
- **Live updates need the login on the connection** (`realtime.setAuth`); the apps must do it before they subscribe.
- If a function in the contract must change, tell Rubaiya and Mithi **before** you change it.

## Running it

The backend lives in **one Supabase cloud project** (shared by both apps). Docker and a local copy are **not set up**; `supabase/config.toml` holds the settings for it if that is ever done.

To rebuild the backend from nothing, in the Supabase dashboard: (1) paste each file of `migrations/` into the SQL Editor, one **New query** per file, **in order**; (2) Authentication, Email: sign-up **on**, email confirmation **off**; (3) run `approve_test_accounts.sql`; (4) create the 5 test logins by hand (tick Auto Confirm User, choose private passwords); (5) run `seed.sql`; (6) run both checks.

## Status

The backend is built and tested: 10 migration files, 126 database checks and 30 real client checks. For the live picture (what is done, in progress and waiting), read [`STATUS.md`](./STATUS.md).
