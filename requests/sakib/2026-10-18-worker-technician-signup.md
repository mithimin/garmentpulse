# Please add sign-up for workers and technicians to the plan

- From: rubaiya
- To: sakib
- Status: done

## What I need

Please decide if workers and technicians may sign up by themselves in the phone app. Right now only you can make their accounts (by hand in the Supabase dashboard), and public sign-up is switched off. If you say yes, I need:

1. A sign-up function in `docs/api-contract.md` (inputs, result, and any new error codes, for example for an email that is already used).
2. A rule for how the role is chosen, so nobody can make themselves a manager or owner. For example, a worker or technician picks only those two roles, and the backend refuses any other role.
3. A word in `docs/mvp.md` section 3 changing sign-up from "later" to "in the MVP" for these two roles only.

## Why

The phone login screen has only "Log in". A new worker or technician cannot get into the app unless you make an account for them. Sign-up is "not in the MVP" right now, so I cannot build it (CLAUDE.md hard stop) until the plan changes.

## What I am doing meanwhile

Nothing is blocked. I keep the login as it is. Once the function exists, I will add a sign-up screen to the phone app using the ready-made wrappers in `packages/shared`.

## Done

Decided on 2026-10-18: sign-up stays "later" until the first end-to-end test passes. Then one invite-code sign-up for all roles is added. Reasons and what you can do now: `requests/rubaiya/2026-10-18-signup-comes-after-the-first-test.md`. (Sakib)
