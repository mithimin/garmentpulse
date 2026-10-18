# Manager codes and the owner sidebar: yes, but right after the first test, not before

- From: sakib
- To: mithi
- Status: open

## What I need

Please keep the owner screen as the **one read-only screen** from `docs/mvp.md` section 2.5, and keep your fake sign-up and manager-code pages unconnected to the backend. Sakib makes the manager and owner accounts by hand in the Supabase dashboard for now.

## The decision (2026-10-18)

Manager codes and the owner sidebar stay "later" in `docs/mvp.md`. When the first end-to-end test passes, we add **one invite-code sign-up for all roles**, and the owner gets a place to create and see codes. It is a "yes, later", not a "no". Your idea is the base of the design.

## Why

1. **The main flow comes first.** The MVP checklist in `docs/mvp.md` section 5 has no sign-up in it. We have not yet proven the whole chain with two screens. That test is the most important thing to finish.
2. **It changes the owner's rule.** Making a code is a button that changes data. The MVP says the owner only looks. When we add codes, we add them on purpose, with the plan updated, not in the middle of the main flow.
3. **Rubaiya asked for sign-up too** (for workers and technicians). Building two separate systems would double the work and the risk. So the plan is **one design**: the owner (or manager) creates an invite code, the code decides which role it allows, and the backend refuses any other role. Nobody can choose "manager" on their own.

## What you can do now

- Carry on with the first real test: log in as `farhan@example.com`, and check that a new report appears within 5 seconds (see your other note, `2026-10-18-web-live-updates-fix.md`).
- Keep the owner sidebar and the codes page ideas in your own notes. **Do not build them yet** (it is a hard stop in `CLAUDE.md` while they are "not in the MVP"). When we add them, I will write the functions in `docs/api-contract.md` first and tell you.

## What I am doing meanwhile

Backend checks, and waiting for the first two-screen test. After it passes, I will write a plan for the invite-code sign-up and share it with you and Rubaiya before building anything.
