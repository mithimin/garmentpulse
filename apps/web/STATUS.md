# STATUS: GarmentPulse Web (`apps/web/`)

**Owner: Mithi.** Only Mithi's sessions change this file.

This is the "where are we?" page for the website. The root `CLAUDE.md` loads it into **every** teammate's Claude, so keep it short, true, and in simple words. **Update it before you finish each piece of work.**

**Last updated:** 2026-10-18 by Mithi's session

## Done

- The Next.js project exists and shows a "hello" page connected to `@garmentpulse/shared`.
- Building blocks (branch `features/web-screens`, pushed, waiting for review): fonts, one blue theme (`app/globals.css`), the web logo, top bar with Log out, language switch (English / Bangla, Bangla digits), card, buttons, status and free/busy labels, inputs, count box, table, loading / empty / error messages, and a "page not found" page.
- Login (fake, branch `features/web-screens`): TWO login pages, `/login` for managers and `/owner-login` for the owner (shared form in `components/LoginForm.tsx`). A bar at the top of both pages lets the person pick Manager or Owner; an account from the other role still gets the normal "could not sign you in" sentence, fake login in `auth/fakeAuth.ts` (any password works; manager and owner emails log in; a worker or technician email shows the `WRONG_PLATFORM` sentence), a session memory in `auth/AuthContext.tsx`, and a role door in `auth/RoleGate.tsx` that sends logged-out people to `/login` and shows "You cannot open this page" for the wrong role. `/manager` and `/owner` are placeholders for now.
- Sign-up (fake, branch `features/web-signup`): `/signup` page with full name, email, password and "manager or owner?". A manager needs a one-time code (OTP) that the owner makes with the "Create a manager code" button on `/owner`; an owner needs the owner code (`FAKE_OWNER_CODE` in `auth/fakeAccounts.ts`). Login pages have a Settings button (language) and sign-up instructions under the form. Needs Sakib: see `requests/sakib/2026-10-18-signup-and-manager-code.md`.
- Real backend wiring (branch `features/web-real-backend`, NOT tested against the real backend yet): `lib/backend.ts` connects to Supabase when `apps/web/.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`); without them the site keeps using fake data. Real login in `auth/realAuth.ts`. Reports, technicians and the owner counts load through `data/useDashboardData.ts` with live updates. The owner page is now the read-only screen (three count boxes and the report list). In real mode the sign-up page is closed and the manager-codes box is hidden.
- Friendly sentences for every error code, in both languages (`language/errorText.ts`).
- Manager start page (`/manager`, fake data): three count boxes, a table of all reports (`components/ReportsTable.tsx`, shows "In the queue" when nobody is assigned) and the technician free/busy list. No Assign button or live updates yet.
- The temporary `/preview` page was deleted.

## In progress

- Login is finished. Next up: the manager screens, then the owner screen, then the final checks.

## Next (in build order from `docs/mvp.md` section 4)

1. Manager: live list of all reports (use `FAKE_REPORTS` from `@garmentpulse/shared`).
2. Manager: technician free/busy list, assign button, queue view (use `FAKE_TECHNICIANS`, `isInQueue`).
3. Owner: one read-only screen with three count boxes (use `summarizeReports`).

## Waiting on someone else

- Sakib: sign-up and manager-code functions, and a decision if they are allowed in the MVP (the owner page is meant to be read-only). Note: `requests/sakib/2026-10-18-signup-and-manager-code.md`.

## Decisions made in this lane

- The manager AND the owner use the same blue colours. (The design doc was changed to match on branch `docs/owner-uses-manager-blue`, not merged yet.)
- The web logo is a copy of the phone app's sewing-machine logo, redrawn for the website in `components/Logo.tsx`.
- The website's normal-text font is IBM Plex Sans (not Jost, which looked too round). Bangla letters use Tiro Bangla. The language button is a small rectangle showing only the current language. The design doc still says Jost and the pill button, so it needs updating.
- Icons come from `lucide-react`. Fonts come from `next/font/google`.

## Good to know for the other lanes

- Sign-up and manager codes are not in `docs/api-contract.md` yet. I proposed two error codes, `EMAIL_TAKEN` and `INVALID_CODE`.
- The owner now uses the manager blue on the web (no dark red). The design doc change is waiting on branch `docs/owner-uses-manager-blue`.
