# Please move the website to React 19.3.0 (when it is convenient)

- From: rubaiya
- To: mithi
- Status: done
- Done (2026-10-26, Mithi): website now uses React 19.3.0 (`react`, `react-dom`, `@types/react`). `npm run check` passes. `apps/mobile/metro.config.js` can be deleted by Rubaiya. Branch `fix/web-team-test-fixes`.

## What I need
In `apps/web/package.json`, change `react` and `react-dom` from `19.2.3` to `19.3.0` (and `@types/react` if the website has it), then check the website still works.

## Why
The phone app moved to Expo SDK 58 (Expo Go needs it). SDK 58 needs React 19.3.0, but the website uses 19.2.3, so the repo now holds two copies of React. I added a small file in the phone app (`apps/mobile/metro.config.js`) so the phone app still works. When the website uses 19.3.0 too, that file can be deleted. Nothing is broken for you today.
