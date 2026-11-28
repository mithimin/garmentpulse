# CLAUDE.md for `supabase/` (the backend)

This file is read when a session works inside `supabase/`. It adds to the root [`CLAUDE.md`](../CLAUDE.md). **The root rules (simple language, the Insprint flow, git rules) still apply here.**

## What this folder is

The **backend** is the hidden part of GarmentPulse that stores information and enforces the rules. It runs on Supabase (login, a Postgres database, and live updates). Both apps talk to it.

**Big idea: the database is the security guard.** The apps are only screens. Every rule that matters is enforced here, so a changed app cannot cheat.

## Layout

| Where | What is in it |
|---|---|
| `migrations/` | Database changes, one new file per change, in order. The newest file is the last change. |
| `tests/` | `api_rules_check.sql` (database checks, run in the SQL Editor or by script) and `real_client.check.ts` (real-login checks, run with `node supabase/tests/run_real_check.mjs`). |
| `seed.sql` | The test story: 5 people, 45 machines, 4 reports. |
| `approve_test_accounts.sql` | Puts the 5 test emails on the approved list, so their logins can be created. |
| `reset_demo_data.sql` | Deletes expenses, reports and invite codes, and empties the Bangla names, so the checks start clean. It refuses to run if any account is not an `@example.com` test account. |
| `fill_bangla_test_names.sql` | Writes the reviewed Bangla names of the test people and machines. Run it after the rules check. |
| `functions/` | Edge Functions (small server programs). Empty on purpose for now. |

## Backend rules

- **Never edit an old migration.** Every change is a **new** migration file.
- **Row Level Security (a lock on each table row) is on for every table.** A new table without it is a bug.
- **Apps never write tables directly.** Important changes happen only through functions that check permissions and run in one step.
- **Every function must match `docs/api-contract.md` exactly:** same name, same inputs, same result shape, same error codes.
- **Roles are checked on the server.** Never trust a role sent by an app.
- **Never put the service-role (secret) key in an app or in git.**
- **Run both checks before and after every backend change.** First clean the data (`reset_demo_data.sql`, then `seed.sql`), then run `api_rules_check.sql` and `node supabase/tests/run_real_check.mjs`. Add a check for every new rule.
- **The sign-up guard applies to everybody.** A new login is accepted only with a good invite code or with an email on `approved_accounts`.
- **Watch out for empty values in SQL.** Use `coalesce(...)` or `is distinct from` so a permission check cannot silently let people in.
- **Live updates need the login on the connection** (`realtime.setAuth`). The apps do this before they subscribe.
- **Database changes are made by running the migration files,** not by hand in the Supabase dashboard.

## Status

The backend is on the real Supabase project, with the MVP and the expense tables and functions. Migration files, the seed, and both checks are in this folder. The current picture lives in **Insprint**.
