# CLAUDE.md for `apps/mobile/` (GarmentPulse Mobile)

This file is read when a session works inside `apps/mobile/`. It adds to the root [`CLAUDE.md`](../../CLAUDE.md). **The root rules (simple language, the Insprint flow, git rules) still apply here.**

## What this app is

**GarmentPulse Mobile** is the phone app for **workers** and **technicians**. It is built with React Native (Expo) and TypeScript, and must work on both Android and iPhone.

- **Worker** can: log in, see their own machine and its colour, report a problem with it, and see the live status of their reports.
- **Technician** can: log in, see the jobs assigned to them, accept a job, change its status (waiting, in progress, resolved), see past jobs, and (second step) send a repair cost with an invoice photo and a receipt photo.
- Only **worker and technician accounts** work here. A manager or owner who logs in is signed out with a clear message (`WRONG_PLATFORM`).
- **Both languages (Bangla and English)** are needed on the main screens. The language switch is a small pill button in the **top-right corner of every screen**.
- Buttons are **48 px tall**, nothing tappable is smaller than 44 px, and status colours always come with a word. Follow [`docs/design-system.md`](../../docs/design-system.md).
- Not built yet: voice input, the AI chatbot, push notifications, dark mode. Repair-cost screens are the **second step** and may be built (see `docs/api-contract.md` section 4.8).

## Read before you build

| Need | Read |
|---|---|
| What the product must do | [`docs/prd.md`](../../docs/prd.md) and [`docs/mvp.md`](../../docs/mvp.md) |
| Exact backend functions, inputs, results, error codes | [`docs/api-contract.md`](../../docs/api-contract.md) |
| How the screens should look | [`docs/design-system.md`](../../docs/design-system.md) |
| How the whole system fits together | [`docs/architecture.md`](../../docs/architecture.md) |

## How this app talks to the backend

- **Only call the functions listed in `docs/api-contract.md`**, with the exact names and inputs written there.
- **Never write to database tables directly.** The backend functions do the checking.
- Use the ready-made wrappers in `packages/shared` (`createApi`) instead of typing function names by hand.
- **Turn error codes into friendly sentences** in this app's screen text (in both languages). Never show a raw code like `TECHNICIAN_BUSY` to a person.
- **Never put secret keys in code.** The app uses only the publishable key, read from the local `.env` file (`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`).

## Working style for this folder

- Follow the one flow in the root `CLAUDE.md`: task in Insprint, its own branch, In progress, PR, In review.
- Use the shared fake data in `@garmentpulse/shared` and the words in its `labels.ts`. Do not make your own copies.
- Every file starts with a short comment saying what it is for, in plain words.
- Keep screens simple. Prefer small files that do one thing.

## Status

The phone app runs on the real backend: login, reports, jobs, sign-up with invite codes, and live updates. The repair-cost screens are not built yet. The current picture lives in **Insprint**.
