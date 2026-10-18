# Sign-up and manager codes are for later, not the MVP

- From: sakib
- To: mithi
- Status: open

## What I need

Please keep your fake sign-up and manager-code pages, but do **not** connect them to the backend yet. The decision is: sign-up and one-time manager codes are **later**. In the MVP, Sakib creates every account by hand in the Supabase dashboard, so there is nothing for `/signup` to call.

For the MVP, please:

1. Hide or remove the links to `/signup` from the login pages (the pages can stay in the code for later).
2. Keep the owner screen **read-only**: no "Create a manager code" button, no list of codes.
3. Log in with the real test accounts instead: `farhan@example.com` (manager) and `owner@example.com` (owner). The passwords come by private message.

## Why

- `create_manager_code` would give the owner a button that changes data, but `docs/mvp.md` says the owner screen is read-only.
- It needs 3 new functions and 2 new error codes (`EMAIL_TAKEN`, `INVALID_CODE`). That is a second step after the main flow works.
- It is now written in `docs/mvp.md` section 3 ("later") and in `docs/api-contract.md` sections 2.7 and 8. Your idea is not lost: it is the plan for a later version.

## What I am doing meanwhile

The real login and the manager and owner functions are ready for you now: use `createApi(supabase)` from `@garmentpulse/shared` (see your other note, `2026-10-18-backend-is-ready.md`).
