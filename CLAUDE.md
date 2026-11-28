# CLAUDE.md

This file is the first thing every new Claude Code session reads. It says what GarmentPulse is, how the team works, where the detailed docs live, and the one working flow everyone follows.

---

## What We Are Building

**GarmentPulse** is an app for garment factories (factories that sew clothes). It helps when a machine breaks.

- A **worker** reports a broken machine.
- The **manager** sees the report and sends a free **technician**.
- The **technician** accepts the job, repairs the machine, and updates the status.
- The **owner** can watch everything, but cannot change a report. In the second step the owner also approves or rejects big repair costs.
- Four roles: worker, technician, manager, owner. Each role only sees and does what it is allowed to do. The server (the database) checks this, not only the app.
- It ships as **two apps**:
  - **GarmentPulse Mobile**: a phone app for workers and technicians.
  - **GarmentPulse Web**: a website dashboard for managers and the owner.
- The first version is the **MVP** (the smallest version that still solves the main problem). See `docs/mvp.md`. Section 3.1 of that file lists the **second step** (repair costs with invoice and receipt photos, and owner approval), which is being built now.

**Current status:** the MVP works on the real backend and was tested on real devices. Sign-up with invite codes works on both apps. The second step's backend is on the real project. The phone repair-cost screen is not built yet, and the website's repair-cost pages use fake data. The Bangla words still need a Bangla speaker to check them. The live task list is in **Insprint**, not in this file.

---

## Team and Working Flow

Three friends build GarmentPulse together. **None of us is a professional developer.** Everyone can change any part of the repo. There are no lanes and no owners.

### The one flow (every task, every session)

Use **Insprint** for tasks. This Claude is already connected to the team's Insprint account and project.

1. **Pick a task.** Open Insprint and take the **latest** task that is not started. Before you start, check that nobody else has it **In progress**. If someone does, pick the next one.
2. **Start a branch.** Pull the latest `main` first. Then make a new branch for this one task only. Use the prefixes listed in the Rules section, and put the task ID in the name (for example `features/IN-12-machine-page`).
3. **Move the task to In progress** in Insprint.
4. **Do all the work for that task.** Do not wait for anyone. Anyone may change any file, including files that look like another person's work.
5. **Only if you truly need someone else's unfinished task first,** say so in one short, plain line in the chat. Say what you need and why, in simple words. Then keep doing everything else that does not depend on it. Do not write files or notes for this.
6. **Test before you push.** Run `npm run check`. It must pass.
7. **Commit and push** your branch. Never push to `main`.
8. **Open a Pull Request (PR)** into `main`, and move the task to **In review**.
9. **Never move a task to Done** unless a person explicitly says so. A PR being merged does not make a task Done.

A **PR** (pull request) is a request asking the team to add your branch to `main`. A **merge** adds it. The team's GitHub rule says one other person must review a PR before it merges. CI (the automatic checks on GitHub) must also be green.

### Database work (Supabase)

- All database changes are **new files** in `supabase/migrations/`. Never edit an old migration file.
- Run database changes with the scripts in this repo, using the keys in the private files. Do **not** change the database by hand in the Supabase dashboard.
- Tests for the database are in `supabase/tests/`. Run them after any database change.

### Private files and keys

- Each person's private settings live in `.env` files (`apps/mobile/.env`, `apps/web/.env.local`, and `.env.secret` at the top). Git ignores all of them.
- Scripts may read these files to connect. **Never print their values, never commit them, and never paste them in chat.**
- The Supabase **secret key** and the database password live only in `.env.secret`. They never go in an app, in git, or in a chat.
- The **publishable key** is the public key. Apps may use it, because the database's security rules protect the data.

---

## Rules

### Simple language (strict, for every session and every teammate)

Rubaiya, Mithi, and Sakib are students, not professional developers. Talk to each of them as if you were talking to a curious 12-year-old kid who has never built anything like this. This rule is strict and has no exceptions.

- **Explain a hard word before you use it.** Give a one-sentence everyday meaning first, then use the word. Example: "the *backend* (the hidden part of the app that stores information and enforces the rules)".
- **Use everyday comparisons.** Example: "A database is like a giant school notebook where each page has neat rows."
- **Short sentences and short paragraphs.** One idea at a time.
- **Never assume they already know something.** Do not say "obviously", "simply", "just", or "as you know".
- **Spell out every short form** (like API, RPC, RLS, PR, CI) the first time, and explain it in plain words.
- **Say what you did and why**, not only the commands or code.
- **Explain errors in plain words:** what went wrong, why, and what happens next.
- This applies to chat replies, plans, and PR descriptions.

### Everything else

- If something is unclear, make the most sensible choice, say what you chose in one line, and keep going. Ask only when a wrong choice could break something that cannot be undone.
- Use multiple-choice questions when you ask something.
- Never push to `main`. Always use a new branch.
- Before you start new work, fetch and pull the latest `main`.
- Run `npm run check` before every push. Code must not go to a remote branch until it passes.
- Branch names must follow these prefixes:
  - `features/` for new features
  - `fix/` for bug fixes
  - `docs/` for documentation
  - `test/` for testing work
  - `refactor/` for restructuring code without changing behavior
  - `chore/` for maintenance tasks such as dependency updates or config changes
- Use the user's configured git `user.name` and `user.email` for all commits.
- **Never add a co-author or Claude attribution.** No `Co-authored-by` trailers, and no mention of Claude or Claude Code in commits or PRs. A PR should read as if a human wrote it.
- Commit subjects are short, in the imperative mood, and one line. Example: `Add login form`, not `Added login form`. Add a body only when the change truly needs one.
- PR titles and descriptions are written in simple language, so a non-technical 12-year-old can understand them.
- When merging a PR, always use **squash**. The squash message is a short one-line summary in the imperative mood, with no PR number.
- Unused local branches: ask the user before removing them.
- Never remove remote branches on your own.
- Document every file well enough that someone reading it years later can still understand its purpose. Start each file with a short comment about what it is for.

### Hard stops (never, for anyone)

- Never print, paste, or commit a key, a password, or the contents of a `.env` file.
- Never put the Supabase **secret** key in an app, in git, or in a chat.
- Never force-push, never rewrite someone else's branch, never push to `main`.
- Never change a function name, input name, or error code from `docs/api-contract.md` in app code without changing the contract in the same PR.
- Never build something that waits in `docs/mvp.md` section 3. Section 3.1 (the second step) may be built.

---

## Full Context (loaded automatically)

@docs/mvp.md
@docs/api-contract.md

The longer documents are read **when needed**, using the Doc Routes table below: `docs/prd.md`, `docs/architecture.md`, `docs/plan.md`, and `docs/design-system.md`.

---

## How We Build It

- **Stack:** React Native with Expo for the phone app (one codebase for iPhone and Android), Next.js (a tool for building websites with React) for the web app, TypeScript everywhere, SQL for the database.
- **Backend:** one Supabase project shared by both apps. It provides email and password login, Postgres (the database), and Realtime (live updates, so a new report shows on the manager's screen within 5 seconds).
- **The database is the security guard.** Every rule that matters is enforced in Postgres, using Row Level Security (a lock on each row of data) and SQL functions. The apps are only screens.
- **The apps never write important tables directly.** They call SQL functions (RPC, which means "ask the database to run a ready-made function"). Each function runs in one step, checks permissions, then writes.
- **Repo layout:**
  - `apps/mobile/`: GarmentPulse Mobile (workers and technicians)
  - `apps/web/`: GarmentPulse Web (managers and the owner)
  - `packages/shared/`: code both apps use (types, status names, error codes, fake data, the calls to the backend)
  - `supabase/migrations/`: database changes, in order
  - `supabase/tests/`: database tests and real-login tests
  - `docs/`: product, architecture, the API contract, and the MVP plan
- **Database changes are always a new migration file.** Never edit an old one.
- **Anything both apps need goes in `packages/shared`.** Never copy it.
- **The API contract is the agreement** between the apps and the backend: `docs/api-contract.md`. `packages/shared` must match it, and a check enforces that.
- **Words shown to people (statuses, free/busy, roles) come from `packages/shared/src/labels.ts`,** in English and Bangla. Never type them again inside an app.

---

## Getting Started (Running the Project)

Words explained: **Node** is the engine that runs our tools. **npm** is the tool that downloads the libraries (ready-made code) we use. A **workspace** is a repo that holds several projects together.

1. Install **Node** (version 20.19 or newer) and **git**.
2. In the top folder, run `npm install`. This downloads everything for all projects at once.
3. Put your private keys in the `.env` files (see "Private files and keys" above). Ask the team for the values. Never share them.
4. Start your app:
   - Phone: `npm run start --workspace @garmentpulse/mobile`, then open it with the Expo Go app.
   - Website: `npm run dev --workspace @garmentpulse/web`, then open `http://localhost:3000`.
5. **Before every push, run `npm run check`.** It checks formatting (Prettier), spelling and style (ESLint), types (TypeScript), the tests, and the contract and key checks. It must pass. GitHub runs the same checks on every PR.

---

## Where to Find Things (Doc Routes)

| Question | Read this |
|---|---|
| What should the product do? Who are the users? | [`docs/prd.md`](./docs/prd.md) |
| How is it built? | [`docs/architecture.md`](./docs/architecture.md) |
| Which features are in the first version, and which wait? | [`docs/mvp.md`](./docs/mvp.md) |
| Who builds what, and in which order? | [`docs/plan.md`](./docs/plan.md) |
| How should screens look? | [`docs/design-system.md`](./docs/design-system.md) |
| Which backend functions can the apps call, with what inputs and error codes? | [`docs/api-contract.md`](./docs/api-contract.md) |
| What is being worked on right now? | **Insprint** |

**Source of truth:** if the PRD and another doc disagree about a product rule, **the PRD wins** (except that `docs/mvp.md` decides what is in or out of the first version).

**Quick pointers:**

- The report flow: worker reports, then the manager assigns a **free** technician, then the technician accepts and updates the status. If all technicians are busy, the report waits in a **queue**.
- The owner web app has three pages: **Dashboard**, **Reports** (read-only), and **Manager codes**. The owner cannot change any report.
- **Second step, repair costs:** a technician sends a repair cost with an invoice photo and a receipt photo. At or under the owner's limit it is approved; otherwise it waits for the owner, who approves or rejects it. The manager records approved costs. Workers see no costs. See `docs/api-contract.md` section 4.8.
- **Sign-up uses invite codes:** the owner makes manager codes, a manager makes worker and technician codes. A code works once and expires after 7 days. Owner accounts are made by hand.
- Workers and technicians use the **phone app**. Managers and the owner use the **web app**. Logging into the wrong one fails with `WRONG_PLATFORM`.
- The app has **two languages (Bangla and English)** with a small switch in the top-right corner of every screen.
- Statuses are colour-coded **and** always have a word next to the colour.
