# STATUS: GarmentPulse Mobile (`apps/mobile/`)

**Owner: Rubaiya.** Only Rubaiya's sessions change this file.

This is the "where are we?" page for the phone app. The root `CLAUDE.md` loads it into **every** teammate's Claude, so keep it short, true, and in simple words. **Update it before you finish each piece of work.**

**Last updated:** 2026-11-14 by Rubaiya's session

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

- Upgraded to Expo SDK 58 (branch `chore/upgrade-expo-sdk-58`), because Expo Go no longer ran SDK 57: Expo 58, React 19.3.0, React Native 0.88.0. The app builds, `npm run check` passes, and it runs in Expo Go on a phone. The extra `metro.config.js` was removed again once the website moved to React 19.3.0, so the whole repo now has one React.

- Log out now goes to the login page, not the sign-up page (item 1 of Sakib's team-test note; tried on a phone, merged). 

- Sign-up now has the "I am a" Worker / Technician choice (item 2 of the same note; tried on a phone, merged). The invite code still decides the role. Before any account is made, the app asks the code (`check_invite_code`) and, if the code is for the other role, shows "This code is for a technician. Please choose Technician above." (English and Bangla, `codeIsFor` in `screenText.ts`). No new backend function or error code.

- New website look (branch `features/mobile-website-theme`, 2026-11-14, checks pass, NOT yet looked at on a phone): the whole phone app now copies the website: warm cream page, chocolate-brown bars and buttons (`#402417`), sky-blue accents, big rounded cards, pill buttons, no dashed stitch lines. Colours are in `src/theme.ts` (measured from the website screenshot). Pictures cut from Rubaiya's reference picture live in `assets/theme/` (factory, scissors, steam press, tape measure, mannequin). New parts: `PictureHeader` (greeting on the factory photo, worker and technician Home), `PictureCard` (picture + words for empty lists), `LogoTile` (logo on a cream tile). Login and sign-up have the factory picture on top. The earlier maroon theme was thrown away.

- Palette and login picture (same branch, 2026-11-14, checks pass, NOT yet looked at on a phone): the colours now come from Rubaiya's "trend colours" picture (Cannoli Cream page `#FAF5E4`, Cacao Nibs bars (now the login brown `#5B3C2E`), Chocopie text `#432F2E`, Powder Blue accent `#96B3D0`) in `src/theme.ts`. The login screen follows her login picture: factory photo on top with the brown circle, logo, "Garment" brown + "Pulse" blue, tagline between two lines, a rounded card with icons in the boxes and a show/hide eye, "or" line, sign-up link, "Secure & Confidential", and cloth at the bottom corners. The photo pieces are `assets/theme/login-top.jpg` and `login-bottom.jpg`. We kept the Worker / Technician chooser and our own tagline. New Bangla words (`অথবা`, `নিরাপদ ও গোপনীয়`, show/hide password) are a draft for a Bangla speaker. The sign-up screen still has the earlier layout.

- Smaller login card, thread spools at the bottom of login (`ThreadDecoration.tsx`), and a NEW LOGO (same branch, 2026-11-14, checks pass, NOT yet looked at on a phone): a sewing needle whose thread is a blue heartbeat (`Logo.tsx`). The app icon files in `assets/` (icon, splash, Android icons, favicon) were remade from it and the Android icon background is cream `#FFFBEF`.

- Logo and login bottom changed again (same branch, 2026-11-14, checks pass, NOT yet looked at on a phone): the logo is now a realistic thread SPOOL with a NEEDLE (`Logo.tsx`; app icon files in `assets/` remade from it; the earlier needle-and-pulse logo was dropped because Rubaiya wants no pulse in the logo). The bottom of the login screen now has four realistic sewing buttons and a loose blue thread (`ButtonDecoration.tsx`, replacing the thread spools). The login photo shrinks on short phones so the whole box fits without scrolling.

- Logo is now the picture from Rubaiya's login mock-up (2026-11-14, checks pass, NOT yet looked at on a phone): a real-looking wooden spool with blue thread and a steel needle, cut out with a clear background into `assets/theme/logo.png` and shown by `Logo.tsx` (it replaced the drawn version). App icon files in `assets/` were remade from it. It is a small picture (about 700 px wide), so the home-screen icon is a little soft; a bigger original of the logo would make the icons sharper.

- Login bottom buttons redrawn to look real (2026-11-14, checks pass, NOT yet looked at on a phone): thick buttons with a side wall, bevelled shiny rim, hollow middle, deep holes, sewn thread with shine and shadow, and surface texture (horn, plastic, pearl). The drawing is SVG text in `buttonArtSvg.ts`, shown by `ButtonDecoration.tsx` with `SvgXml`. Not yet proven that `SvgXml` shows every detail on a real phone.

- Logo and login bottom changed again (2026-11-14, checks pass, NOT yet looked at on a phone): the logo is a realistic SEWING MACHINE (shaded brown body, steel needle, blue spool on top, hand wheel), drawn as SVG text in `logoArtSvg.ts` and shown by `Logo.tsx`. The spool-and-needle picture moved to the bottom-left of the login screen (`SpoolDecoration.tsx`, `assets/theme/spool.png`, cleaned so no peach patches). The sewing buttons were removed. App icon files were remade from the machine.

- Machine logo made more real and less boxy (2026-11-14, checks pass, NOT yet looked at on a phone): the machine now has a real machine outline (curved arm, rounded head, curved throat, flared base) and chrome parts (tension dial, stitch dial, slotted screws, needle clamp, presser foot, slide plate, knurled hand wheel) in `logoArtSvg.ts`. On the login screen the logo and the bottom spool are about 30% smaller, and the spool has a soft shadow on the cloth. App icon files remade.

- Machine logo made even more real (2026-11-14, checks pass, NOT yet looked at on a phone): glossy enamel band and fine speckles, chrome with reflection bands, a seam panel with a chrome badge, feed teeth and a stitched seam on the cloth, a cool rim light, a hand wheel with rim thickness, and a softer ground shadow (`logoArtSvg.ts`). App icon files remade.

- (Dropped on 2026-11-14: the real-photo machine logo below was tried and Rubaiya did not like it. The logo is the DRAWN brown machine again, `logoArtSvg.ts`, and the photo file was deleted.)
- Logo was a REAL PHOTO of an industrial sewing machine (2026-11-14, checks pass, NOT yet looked at on a phone): cut by hand-tracing from the factory banner in Rubaiya's first picture, with the brown and blue thread spools in front (`assets/theme/machine.png`, shown by `Logo.tsx`). It replaced the drawn machine (`logoArtSvg.ts` was deleted). Slightly smaller on the login screen. App icon files remade. Tiny bits of the old background may still show at the right end of the machine.

- Livelier bottom of the login screen (2026-11-14, checks pass, NOT yet looked at on a phone): the spool moved in from the corner and tilted, a loose blue thread loops and swoops across the cloth, (`BottomDecoration.tsx`, `threadArtSvg.ts`).

- Worker machine map on the Home screen (branch `features/mobile-website-theme`, 2026-11-14, checks pass, NOT yet looked at on a phone, **FAKE data only**): Home is now the factory-photo greeting, then a "Machine map" card, then the latest report. The map has Floor 1 / 2 / 3 tabs (a dot on a floor with a machine that is down), the rows of the chosen floor, and each machine as a coloured seat: cream = OK, dark brown with a pulsing glow = down, butter yellow = waiting, sky blue = in progress, with a legend. Tapping a cream machine opens a small card (floor, row, machine, a box to type what is wrong, Send); tapping any other machine shows what is happening. A short two-tone beep plays once every time a machine turns down (new library `expo-audio`, sound file `assets/sounds/machine-down.wav`). Files: `MachineMap.tsx`, `MachineSeat.tsx`, `MachineReportSheet.tsx`, `MachineIcon.tsx`, `mapStatus.ts`, `useDownSound.ts`, `data/fakeMachineMap.ts`, words in `MAP_TEXT` (`screenText.ts`), colours `MAP_COLORS` (`theme.ts`). A "Demo: a machine stops" button and a fake technician (waiting after 10 s, in progress after 20 s, OK after 35 s) let every colour and the beep be tried. The big "Report a problem" button was removed from Home (the Report tab stays). Sending from the map does NOT make a real report yet.

- Worker Home reshaped, map first (2026-11-14, checks pass, NOT yet looked at on a phone): the scissors picture was removed; the greeting is now a plain hello with the name and NO picture (`Greeting.tsx`; the technician Jobs screen still has the factory-photo greeting); a live repair tracker (`RepairTracker.tsx`) shows above the map while the worker has an unfinished REAL report (Reported, Technician assigned, Fixing now, Done, with the technician's name); the report card from the map now has four picture chips (needle broke, thread keeps breaking, strange noise or smell, machine will not start, `ProblemIcon.tsx`) plus an optional typing box. The map is still FAKE data; the tracker is real. When no report is open, the latest report card shows under the map as before. Ideas not chosen for now: "my machine" and QR scan.

## In progress

- Testing sign-up on a real phone with a code from a manager (or from Sakib).

## Next (in build order from `docs/mvp.md` section 4)

- Nothing planned right now. Waiting for Sakib's Bangla names (the phone already shows them once they exist).

## Waiting on someone else

- Sakib: a floor for every machine, and one function so every worker can see the live state of every machine (note: `requests/sakib/2026-11-14-worker-machine-map.md`). Until then the worker map is fake.
- Sakib or a manager: one worker code and one technician code, to test sign-up.

## Decisions made in this lane

- Fonts: we keep the phone's normal font. The custom fonts (Cormorant Garamond, Jost) will NOT be added (decided 2026-10-20).
- The whole phone app (workers AND technicians) uses the denim blue of the login screen. The purple worker and green technician colours in `docs/design-system.md` are NOT used. (That document still needs updating.)
- The fake login and fake reports store were replaced by the real backend (step 4). Test accounts are listed in `requests/rubaiya/2026-10-18-backend-is-ready.md`.
- Words that belong to this app only (button names, error sentences) live in `apps/mobile/src/language/screenText.ts`. Status, free/busy and role words come from the shared `labels.ts`.

## Good to know for the other lanes

- The worker Home now has a machine map (floors, rows, coloured seats). It needs a floor for each machine and a live state for each machine from the backend (see the note to Sakib). The map is new and not in `docs/mvp.md` yet. The Bangla words in `MAP_TEXT` are a first draft and need a Bangla speaker.
- The phone sign-up is ready for the first test: it needs an invite code from a manager.
- The Bangla error sentences in `screenText.ts` are a first draft and need a Bangla speaker to read them.
