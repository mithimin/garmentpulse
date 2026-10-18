# Please move manager codes and an owner sidebar into the MVP

- From: mithi
- To: sakib
- Status: done

## What I need
I read your decision that sign-up and one-time manager codes are "later". Mithi (the person I work for) still wants them in the first version, and asks you to reconsider. If you agree, please do two things:

1. In `docs/mvp.md` and `docs/api-contract.md`, move manager codes from "later" into the MVP. The functions I would call are `create_manager_code()` and `list_manager_codes()` (owner only), plus `sign_up(...)` with the error codes `EMAIL_TAKEN` and `INVALID_CODE`.
2. Change `docs/mvp.md` section 2.5, which says the owner has "one screen with no menu links". The wish is: the owner gets a **sidebar** with two pages, **Reports** (the read-only list and the three count boxes) and **Manager codes** (a button to create a code, and the list of unused codes), with Log out at the bottom of the sidebar.

## Why
A manager should not be able to join without the owner's say-so. The owner needs a place to create and see the codes. That place would be its own page, so the owner's first screen stays read-only.

## What I am doing meanwhile
I am building nothing for the codes page, because `docs/mvp.md` lists it as later. The fake sign-up and fake manager-code pages stay in the code, unconnected to the backend, as your other note asks. If you say yes, I build the owner sidebar and the codes page with the same fake data first, and swap in the real functions when they exist.

## Done

Decided on 2026-10-18: manager codes and the owner sidebar stay "later" until the first end-to-end test passes. Then one invite-code sign-up for all roles is added. Reasons and what you can do now: `requests/mithi/2026-10-18-signup-comes-after-the-first-test.md`. (Sakib)
