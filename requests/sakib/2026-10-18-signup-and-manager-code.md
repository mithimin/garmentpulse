# Add sign-up and one-time manager codes (OTP) to the backend plan

- From: mithi
- To: sakib
- Status: done

## What I need
Please add sign-up and one-time manager codes to `docs/api-contract.md` and the backend. This answers the open question "How do accounts and roles get created?" in section 8 of the contract. What I built on the website (with fake data) works like this:

- A new person signs up with a full name, email, password, and a choice of manager or owner.
- A **manager** can only sign up with a one-time code (OTP) that the **owner** made. The code works once.
- An **owner** can only sign up with a secret owner code (who holds it is still to be decided).
- The owner page has a "Create a manager code" button and a list of unused codes.

I need functions like these (names are only my guess, change them if you want):
- `sign_up(full_name, email, password, role, code)`
- `create_manager_code()`, owner only, returns the code
- `list_manager_codes()`, owner only, unused codes

I also used two new error codes that are NOT in the contract yet: `EMAIL_TAKEN` (that email already has an account) and `INVALID_CODE` (the code is wrong or already used).

## Why
The owner wants managers to need the owner's say-so before they can get in. Also, `create_manager_code` is a button that changes data on the owner's screen, but the MVP plan says the owner screen is read-only. Please decide if sign-up and codes are allowed in the MVP, or if `docs/mvp.md` needs a change.

## What I am doing meanwhile
I use fake sign-up and fake codes saved in the browser. The files are `apps/web/auth/fakeAuth.ts` and `apps/web/auth/fakeAccounts.ts`. When the real functions exist, only those two files change.

## Done

Decided on 2026-10-18: sign-up and one-time manager codes are NOT in the MVP. Sakib creates all accounts by hand. They are now listed as "later" in `docs/mvp.md` section 3 and in `docs/api-contract.md` sections 2.7 and 8. Details: `requests/mithi/2026-10-18-signup-is-later.md`. (Sakib)
