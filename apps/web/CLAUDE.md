# CLAUDE.md for `apps/web/` (GarmentPulse Web)

This file is read when a session works inside `apps/web/`. It adds to the root [`CLAUDE.md`](../../CLAUDE.md). **The root rules (simple language, the Insprint flow, git rules) still apply here.**

## What this app is

**GarmentPulse Web** is the website dashboard for **managers** and the **owner**. It is built with Next.js (a tool for building websites with React) and TypeScript.

- **Manager** can: log in, see reports and the Machine map live (new reports appear within 5 seconds), see each technician as free or busy, assign a free technician to a report, see the queue, make worker and technician invite codes, and (second step) see repair costs with their photos and **record** the approved ones.
- **Owner** can: log in, see the three count boxes and a read-only list of all reports, make manager invite codes, and (second step) set the **expense limit** and **approve or reject** repair costs. The owner cannot change or assign any report.
- Only **manager and owner accounts** work here. A worker or technician who logs in is signed out with a clear message (`WRONG_PLATFORM`).
- A worker must not be able to open manager or owner pages, **even by typing the address**. The backend enforces this, and the pages must also redirect or refuse.
- **Both languages (Bangla and English)** are needed on the main pages. The language switch is a small pill button in the **top-right corner of every page**.
- Follow [`docs/design-system.md`](../../docs/design-system.md) for colours (manager and owner use the same blue), fonts and status labels.
- Not built yet: the AI chatbot, voice input, camera alerts, free/paid plans, push notifications, dark mode.

## Read before you build

| Need | Read |
|---|---|
| What the product must do | [`docs/prd.md`](../../docs/prd.md) and [`docs/mvp.md`](../../docs/mvp.md) |
| Exact backend functions, inputs, results, error codes | [`docs/api-contract.md`](../../docs/api-contract.md) |
| How the pages should look | [`docs/design-system.md`](../../docs/design-system.md) |
| How the whole system fits together | [`docs/architecture.md`](../../docs/architecture.md) |

## How this app talks to the backend

- **Only call the functions listed in `docs/api-contract.md`**, with the exact names and inputs written there.
- **Never write to database tables directly.** The backend functions do the checking.
- Use the ready-made wrappers in `packages/shared` (`createApi`) instead of typing function names by hand.
- **Turn error codes into friendly sentences** in this app's page text (in both languages). Never show a raw code to a person.
- **Never put secret keys in code.** Keys go in the local `.env.local` file. Only keys starting with `NEXT_PUBLIC_` reach the browser, and only the publishable key may ever start that way.

## Working style for this folder

- Follow the one flow in the root `CLAUDE.md`: task in Insprint, its own branch, In progress, PR, In review.
- Use the fake data in `@garmentpulse/shared` and the words in its `labels.ts`. Do not make your own copies.
- Every file starts with a short comment saying what it is for, in plain words.
- Keep pages simple. Prefer small files that do one thing.
- Do not change the React version casually. `react` and `react-dom` are kept on the same version as the phone app so the two apps do not clash.

## Status

The website is connected to the real backend. Manager and owner pages, invite codes, and the Machine map work. The repair-cost pages are built on fake data and wait for the real phone screen. The current picture lives in **Insprint**.
