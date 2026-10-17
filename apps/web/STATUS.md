# STATUS: GarmentPulse Web (`apps/web/`)

**Owner: Mithi.** Only Mithi's sessions change this file.

This is the "where are we?" page for the website. The root `CLAUDE.md` loads it into **every** teammate's Claude, so keep it short, true, and in simple words. **Update it before you finish each piece of work.**

**Last updated:** 2026-10-18 by Mithi's session

## Done

- The Next.js project exists and shows a "hello" page connected to `@garmentpulse/shared`.
- Building blocks (branch `features/web-screens`, pushed, waiting for review): fonts, one blue theme (`app/globals.css`), the web logo, top bar with Log out, language switch (English / Bangla, Bangla digits), card, buttons, status and free/busy labels, inputs, count box, table, loading / empty / error messages, and a "page not found" page.
- `/preview` is a temporary page that shows all the blocks. It will be deleted before the final pull request.

## In progress

- Building blocks are finished. Next up: lists 3 to 7 of the Puja holiday plan (friendly error sentences, login, manager screens, owner screen, final checks).

## Next (in build order from `docs/mvp.md` section 4)

1. Login page (fake login first).
2. Manager: live list of all reports (use `FAKE_REPORTS` from `@garmentpulse/shared`).
3. Manager: technician free/busy list, assign button, queue view (use `FAKE_TECHNICIANS`, `isInQueue`).
4. Owner: one read-only screen with three count boxes (use `summarizeReports`).
5. Friendly sentences for every error code, in both languages.

## Waiting on someone else

- Nothing yet. (If you are blocked, write a note in `requests/<owner>/` and list it here.)

## Decisions made in this lane

- The manager AND the owner use the same blue colours. (The design doc was changed to match on branch `docs/owner-uses-manager-blue`, not merged yet.)
- The web logo is a copy of the phone app's sewing-machine logo, redrawn for the website in `components/Logo.tsx`.
- Icons come from `lucide-react`. Fonts come from `next/font/google`.

## Good to know for the other lanes

- The owner now uses the manager blue on the web (no dark red). The design doc change is waiting on branch `docs/owner-uses-manager-blue`.
