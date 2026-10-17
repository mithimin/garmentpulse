# STATUS: GarmentPulse Web (`apps/web/`)

**Owner: Mithi.** Only Mithi's sessions change this file.

This is the "where are we?" page for the website. The root `CLAUDE.md` loads it into **every** teammate's Claude, so keep it short, true, and in simple words. **Update it before you finish each piece of work.**

**Last updated:** 2026-10-18 by Mithi's session

## Done

- The Next.js project exists and shows a "hello" page connected to `@garmentpulse/shared`.
- Building blocks (branch `features/web-screens`, pushed, waiting for review): fonts, one blue theme (`app/globals.css`), the web logo, top bar with Log out, language switch (English / Bangla, Bangla digits), card, buttons, status and free/busy labels, inputs, count box, table, loading / empty / error messages, and a "page not found" page.
- Login (fake, branch `features/web-screens`): `/login` page, fake login in `auth/fakeAuth.ts` (any password works; manager and owner emails log in; a worker or technician email shows the `WRONG_PLATFORM` sentence), a session memory in `auth/AuthContext.tsx`, and a role door in `auth/RoleGate.tsx` that sends logged-out people to `/login` and shows "You cannot open this page" for the wrong role. `/manager` and `/owner` are placeholders for now.
- Friendly sentences for every error code, in both languages (`language/errorText.ts`).
- `/preview` is a temporary page that shows all the blocks. It will be deleted before the final pull request.

## In progress

- Login is finished. Next up: the manager screens, then the owner screen, then the final checks.

## Next (in build order from `docs/mvp.md` section 4)

1. Manager: live list of all reports (use `FAKE_REPORTS` from `@garmentpulse/shared`).
2. Manager: technician free/busy list, assign button, queue view (use `FAKE_TECHNICIANS`, `isInQueue`).
3. Owner: one read-only screen with three count boxes (use `summarizeReports`).

## Waiting on someone else

- Nothing yet. (If you are blocked, write a note in `requests/<owner>/` and list it here.)

## Decisions made in this lane

- The manager AND the owner use the same blue colours. (The design doc was changed to match on branch `docs/owner-uses-manager-blue`, not merged yet.)
- The web logo is a copy of the phone app's sewing-machine logo, redrawn for the website in `components/Logo.tsx`.
- Icons come from `lucide-react`. Fonts come from `next/font/google`.

## Good to know for the other lanes

- The owner now uses the manager blue on the web (no dark red). The design doc change is waiting on branch `docs/owner-uses-manager-blue`.
