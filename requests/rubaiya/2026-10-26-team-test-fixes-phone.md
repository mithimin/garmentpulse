# Team test found two problems in the phone app

- From: sakib
- To: rubaiya
- Status: open

## What I need

1. **Log out goes to the wrong page (small fix).** After someone signs up and then logs out, the phone shows the **sign-up** page again. It should show the **login** page. The cause is in `App.tsx`: `showSignUp` stays `true`. In the `logout` function, also call `setShowSignUp(false)`.
2. **Sign-up: add the "I am a" choice (Worker / Technician), like the login screen has.** In the team test, people could sign up as a worker with a technician code, and the other way round. The backend is correct: the code decides the role. But people expect the choice to be checked. Please add the same Worker / Technician buttons to `SignUpScreen.tsx`. After `check_invite_code` returns the role, if it is not the chosen one, stop with a friendly sentence in English and Bangla (for example "This code is for a technician. Please choose Technician."). No new backend function and no new error code are needed: do it inside the app, as the login screen does with `roleMismatch`.

If the team prefers to keep the code as the only thing that decides the role (no choice), tell me and ignore item 2.

Progress: item 1 (log out to the login page) is done. Item 2 is still open.

## Why

Both were found by all three of us in the full team test on 2026-10-26.

## What I am doing meanwhile

I reset the demo data before the second team test. The backend does not change for these two items.
