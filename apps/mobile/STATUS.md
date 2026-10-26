# STATUS: GarmentPulse Mobile (`apps/mobile/`)

**Owner: Rubaiya.** Only Rubaiya's sessions change this file.

This is the "where are we?" page for the phone app. The root `CLAUDE.md` loads it into **every** teammate's Claude, so keep it short, true, and in simple words. **Update it before you finish each piece of work.**

**Last updated:** 2026-10-26 by Rubaiya's session

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

- Step 4 (real backend), built on branch `features/mobile-real-backend`:
  - Real login (`src/auth/realAuth.ts`): Supabase email + password, then `get_my_profile()`. A manager or owner is signed out again with `WRONG_PLATFORM`. The fake login was removed.
  - One connection file (`src/backend/supabase.ts`) reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from `apps/mobile/.env`.
  - `src/data/ReportsContext.tsx` now uses the shared `createApi` calls and live updates (Realtime on `reports`, then a fresh download). Screens kept the same shape. Live updates are given the person's login before they subscribe (Sakib's note).
  - Back arrows on the Report, My reports and History tabs, and the Android phone back button does the same (`src/components/useBackAction.ts`).
  - Tested on a real phone: login, reports, jobs and the back buttons work.

- Sign-up with an invite code, built on branch `features/mobile-signup` (NOT tested on a phone yet):
  - New screen `src/screens/SignUpScreen.tsx`: full name, email, password and invite code. The code decides the role (see the "I am a" choice below). Links between login and sign-up, and the Android back button goes back to login.
  - `signUp` in `src/auth/realAuth.ts` uses the shared `signUpWithCode`. The person is logged in right away.
  - Friendly sentences in English and Bangla for `INVALID_CODE`, `EMAIL_TAKEN`, `WRONG_PLATFORM` and `INVALID_INPUT` (`SIGNUP_ERROR_TEXT` in `screenText.ts`).

- Bangla names (branch `features/mobile-signup`): every screen now shows a person's or machine's name through `src/language/localNames.ts`. In Bangla mode it uses `display_name_bn` / `name_bn` when the backend sends one, otherwise the English name. The backend does not send them yet, so names still look English until Sakib adds them.

- Upgraded to Expo SDK 58 (branch `chore/upgrade-expo-sdk-58`), because Expo Go no longer ran SDK 57: Expo 58, React 19.3.0, React Native 0.88.0. The app builds and `npm run check` passes. NOT tried on a phone yet. The extra `metro.config.js` was removed again once the website moved to React 19.3.0, so the whole repo now has one React.

- Log out now goes to the login page, not the sign-up page (item 1 of Sakib's team-test note; tried on a phone, merged). 

- Sign-up now has the "I am a" Worker / Technician choice (item 2 of the same note; tried on a phone, merged). The invite code still decides the role. Before any account is made, the app asks the code (`check_invite_code`) and, if the code is for the other role, shows "This code is for a technician. Please choose Technician above." (English and Bangla, `codeIsFor` in `screenText.ts`). No new backend function or error code.

## In progress

- Testing sign-up on a real phone with a code from a manager (or from Sakib).

## Next (in build order from `docs/mvp.md` section 4)

- Nothing planned right now. Waiting for Sakib's Bangla names (the phone already shows them once they exist).

## Waiting on someone else

- Sakib or a manager: one worker code and one technician code, to test sign-up.

## Decisions made in this lane

- Fonts: we keep the phone's normal font. The custom fonts (Cormorant Garamond, Jost) will NOT be added (decided 2026-10-20).
- The whole phone app (workers AND technicians) uses the denim blue of the login screen. The purple worker and green technician colours in `docs/design-system.md` are NOT used. (That document still needs updating.)
- The fake login and fake reports store were replaced by the real backend (step 4). Test accounts are listed in `requests/rubaiya/2026-10-18-backend-is-ready.md`.
- Words that belong to this app only (button names, error sentences) live in `apps/mobile/src/language/screenText.ts`. Status, free/busy and role words come from the shared `labels.ts`.

## Good to know for the other lanes

- The phone sign-up is ready for the first test: it needs an invite code from a manager.
- The Bangla error sentences in `screenText.ts` are a first draft and need a Bangla speaker to read them.
