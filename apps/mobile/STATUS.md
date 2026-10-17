# STATUS: GarmentPulse Mobile (`apps/mobile/`)

**Owner: Rubaiya.** Only Rubaiya's sessions change this file.

This is the "where are we?" page for the phone app. The root `CLAUDE.md` loads it into **every** teammate's Claude, so keep it short, true, and in simple words. **Update it before you finish each piece of work.**

**Last updated:** 2026-10-17 by Rubaiya's session

## Done

- The Expo project exists and is connected to `@garmentpulse/shared`.
- Step 1 (login), built on branch `features/mobile-login`:
  - Login screen in the manager blue look, with the language switch (EN · বাং) in the top-right corner.
  - Fake login (`src/auth/fakeAuth.ts`): any password works. Worker and technician emails from the fake people list log in. A manager or owner email shows the `WRONG_PLATFORM` message.
  - A "I am a" Worker / Technician chooser on the login screen. If the account is the other role, login stops with a friendly message. This is only a check inside the app (no new error code), because the real backend decides the role by itself.
  - Friendly error sentences in English and Bangla (`src/language/screenText.ts`).
  - A temporary home screen with a "Log out" button.
- New logo (`src/components/Logo.tsx`): a dark blue sewing machine with a gold heartbeat line on its arm and a dashed stitch line on its base, with no background tile, replacing the plain "G" tile. It needed the `react-native-svg` library.

- Step 2 (worker screens), built on branch `features/mobile-worker-screens`:
  - Worker app with a bottom bar: Home, Report, My reports (`src/screens/worker/`).
  - Report form: machine dropdown + description (1 to 500 letters), friendly messages under each box, "Report sent" card.
  - My reports list (newest first) and a details page with the 3-step tracker.
  - Fake reports kept in memory only (`src/data/ReportsContext.tsx`); they disappear when the app closes.
  - Shared building blocks in `src/components/` (cards, buttons, top bar, tab bar, status label, step tracker) that the technician screens will reuse.
  - Dates and numbers show in Bangla digits in Bangla mode (`src/language/format.ts`).

- Step 3 (technician screens), built on branch `features/mobile-technician-screens`:
  - Technician app with a bottom bar: Jobs, History (`src/screens/technician/`).
  - Jobs: a Free/Busy card, then open jobs. A job page has one button for the next step: Accept job, then Start work (Waiting to In progress), then Mark as fixed (to Resolved). Status only moves forward.
  - History: the finished (past) jobs.
  - The fake store (`src/data/ReportsContext.tsx`) now also copies `list_my_jobs`, `accept_job` and `update_job_status`, with the contract's error codes. A worker who logs in afterwards sees the new status.
  - The old temporary home screen was removed.

## In progress

- Nothing right now.

## Next (in build order from `docs/mvp.md` section 4)

1. The custom fonts (Cormorant Garamond, Jost). Fonts are not loaded yet, so text uses the phone's normal font for now.

## Waiting on someone else

- Nothing yet. (If you are blocked, write a note in `requests/<owner>/` and list it here.)

## Decisions made in this lane

- The whole phone app (workers AND technicians) uses the denim blue of the login screen. The purple worker and green technician colours in `docs/design-system.md` are NOT used. (That document still needs updating.)
- The fake login accepts any non-empty password. It is only for building screens and is replaced when the real backend is ready.
- Words that belong to this app only (button names, error sentences) live in `apps/mobile/src/language/screenText.ts`. Status, free/busy and role words come from the shared `labels.ts`.

## Good to know for the other lanes

- The Bangla error sentences in `screenText.ts` are a first draft and need a Bangla speaker to read them.
