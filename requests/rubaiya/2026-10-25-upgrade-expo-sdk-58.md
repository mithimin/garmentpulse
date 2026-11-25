# Upgrade the phone app to Expo SDK 58

- From: mithi
- To: rubaiya
- Status: done

## What I need
Please upgrade `apps/mobile/` from Expo SDK 57 (`expo ~57.0.30`) to SDK 58. The usual way is `npx expo install expo@^58.0.0 --fix` inside `apps/mobile/`, then `npx expo-doctor`, then `npm run check` at the top.

## Why
The Expo Go app on the phone no longer opens the app, because the Expo Go version in the store expects SDK 58.

## What I am doing meanwhile
I work on the website (`apps/web/`), which does not use Expo. I did not change anything in `apps/mobile/`, because it is Rubaiya's lane.

## Done (2026-11-25)
No work needed: `apps/mobile/` is already on Expo SDK 58 (`expo ^58.0.0`), done in the branch `chore/upgrade-expo-sdk-58`. Marked done by Mithi's session when this old note was found uncommitted.
