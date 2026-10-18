# Sign-up with invite codes is ready on the backend: you can build the phone sign-up screen

- From: sakib
- To: rubaiya
- Status: open

## What I need

Please build the **sign-up screen** for workers and technicians, and connect it to the real backend. It follows my earlier note (`2026-10-19-signup-with-invite-codes.md`). Now everything it needs exists, is on `main`, and is **proven on the real project**: 12 real sign-up checks passed through Supabase's real login service, and sign-up is switched on.

## The one call to use

```ts
import { signUpWithCode, getApiErrorCode } from '@garmentpulse/shared';
import { supabase } from '../backend/supabase';

const profile = await signUpWithCode(supabase, {
  platform: 'mobile',
  fullName,   // the typed name
  email,
  password,   // at least 6 characters
  code,       // the invite code; small letters and spaces are fine
});
// profile.role is 'worker' or 'technician'. The person is already logged in.
```

What it does for you: it checks the code, refuses a manager code on the phone (`WRONG_PLATFORM`), signs the person up, and returns their profile. After it returns, do the same steps you do after a normal login: set the profile in your login memory, and give the live-update connection the login (`supabase.realtime.setAuth(...)`), then open the worker or technician screens.

## Errors to show a friendly sentence for (English and Bangla)

When it fails, it throws an `ApiError`. Read the code with `getApiErrorCode(error)` (the same as `getErrorCode`, but it also knows the two new sign-up codes):

| Code | When | Suggested meaning |
|---|---|---|
| `INVALID_CODE` | The code is wrong, already used, or older than 7 days | "That code is wrong, already used or too old. Ask your manager for a new code." |
| `EMAIL_TAKEN` | That email already has an account | "This email already has an account. Please log in." |
| `WRONG_PLATFORM` | A manager code was typed on the phone | You already have a sentence for it |
| `INVALID_INPUT` | An empty name, a bad email, or a password shorter than 6 letters | Show your usual "check the boxes" sentence |
| `UNKNOWN` | Anything else | Your usual "something went wrong" sentence |

**Important:** `INVALID_CODE` and `EMAIL_TAKEN` are **not** in the shared `ERROR_CODES` list yet, on purpose, so your `ERROR_TEXT` table still compiles. Add a small separate table for these two, the way Mithi did (`SIGNUP_ERROR_TEXT` in `apps/web/language/errorText.ts`). When both apps have their sentences, I will join the lists.

## The screen

- Four boxes: full name, email, password, **invite code**. There is **no "who are you?" choice**: the code decides the role.
- A link from the login screen to the sign-up screen, and back.
- Owners never sign up (their accounts are made by hand).

## How to get a code to test with

A **manager** makes worker and technician codes, on the website (Mithi's manager codes page, once she connects it). Until then, ask me and I will make one for you. A code works once and runs out after 7 days.

## Good to know

- **Do not** ever send a role from the screen. The backend ignores it, and the helper does not send one.
- The test accounts you already use (`nila`, `tariq`, `hasan`) are unchanged.
- If something behaves differently from this note, write a note in `requests/sakib/` with what you saw.

## What I am doing meanwhile

Waiting for the first full test, then the Bangla names. I will also keep the real client check up to date.
