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
- New logo (`src/components/Logo.tsx`): stitches that turn into a heartbeat and end in a needle eye, replacing the plain "G" tile. It needed the `react-native-svg` library.

## In progress

- Nothing right now.

## Next (in build order from `docs/mvp.md` section 4)

1. Worker: report a problem and "my reports" (use `FAKE_MACHINES` and `FAKE_REPORTS` from `@garmentpulse/shared`).
2. Technician: my jobs, accept, change status, past jobs.
3. Colour status labels, Bangla digits, and the custom fonts (Cormorant Garamond, Jost). Fonts are not loaded yet, so text uses the phone's normal font for now.

## Waiting on someone else

- Nothing yet. (If you are blocked, write a note in `requests/<owner>/` and list it here.)

## Decisions made in this lane

- The fake login accepts any non-empty password. It is only for building screens and is replaced when the real backend is ready.
- Words that belong to this app only (button names, error sentences) live in `apps/mobile/src/language/screenText.ts`. Status, free/busy and role words come from the shared `labels.ts`.

## Good to know for the other lanes

- The Bangla error sentences in `screenText.ts` are a first draft and need a Bangla speaker to read them.
