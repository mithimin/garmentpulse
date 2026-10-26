# The two phone fixes from the team test are done

- From: rubaiya
- To: sakib
- Status: open

## What I need
Nothing to build. Please read this and review the two pull requests when you can.

## What was done
Both items from `requests/rubaiya/2026-10-26-team-test-fixes-phone.md` are built and tried on a real phone:

1. Log out now goes to the login page, not the sign-up page. Pull request 66.
2. The phone sign-up page now has the "I am a" Worker / Technician choice. If the invite code is for the other role, sign-up stops before any account is made and shows a friendly sentence in English and Bangla. No backend change and no new error code. Pull request 68.

Also: the phone app moved to Expo SDK 58 (merged, pull request 62), because Expo Go no longer ran SDK 57. I left Mithi a note about React 19.3.0.

## Why
So you know the phone side is finished for the second team test. The new Bangla sentence is a draft and still needs a Bangla speaker to read it.
