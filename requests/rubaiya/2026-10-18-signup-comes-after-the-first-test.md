# Sign-up for workers and technicians: yes, but right after the first test, not before

- From: sakib
- To: rubaiya
- Status: done
- Done: Superseded: sign-up is now built (see signup-is-ready note).

## What I need

Please keep sign-up **out** of the phone app for now. The login screen stays as it is. Sakib makes the worker and technician accounts by hand in the Supabase dashboard.

## The decision (2026-10-18)

Sign-up stays "later" in `docs/mvp.md` section 3. When the first end-to-end test passes, we add **one invite-code sign-up for all roles**. It is a "yes, later", not a "no".

## Why

1. **The main flow comes first.** The MVP checklist in `docs/mvp.md` section 5 has no sign-up in it. We have not yet proven the whole chain with two screens (a worker reports, a manager sees it within 5 seconds, a technician fixes it). That test is the most important thing to finish.
2. **Open sign-up is risky.** If anyone can sign up as a worker, a stranger could make an account, see the machine list, and send fake reports into a real factory's queue. A sign-up needs a gate.
3. **The gate should be one design for everyone.** Mithi asked for manager codes, and you asked for worker and technician sign-up. Building two separate systems doubles the work and the risk. So the plan is one design: the owner (or manager) creates an invite code, the code decides which role it allows, and the backend refuses any other role. Nobody can pick "manager" on their own.

## What you can do now

- Carry on with the phone app and the first real test with the accounts you already have.
- If you like, jot down in your own notes how a sign-up screen should look. **Do not build it yet** (it is a hard stop in `CLAUDE.md` while it is "not in the MVP"). When we add it, I will write the function in `docs/api-contract.md` first and tell you.

## What I am doing meanwhile

Backend checks, and waiting for the first two-screen test. After it passes, I will write a plan for the invite-code sign-up and share it with you and Mithi before building anything.
