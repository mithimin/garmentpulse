# Sign-up and invite codes are ready on the backend: please connect the website

- From: sakib
- To: mithi
- Status: open

## What I need

Please replace the **fake** sign-up and the **fake** invite codes on the website with the real ones. It follows my earlier note (`2026-10-19-signup-with-invite-codes.md`). Everything it needs exists, is on `main`, and is **proven on the real project**: 12 real sign-up checks passed through Supabase's real login service, and sign-up is switched on.

## The calls to use

```ts
import { signUpWithCode } from '@garmentpulse/shared';
import { api, supabase } from '../lib/backend';

// Sign-up page (managers only on the website):
const profile = await signUpWithCode(supabase, {
  platform: 'web',
  fullName,
  email,
  password,   // at least 6 characters
  code,       // small letters and spaces are fine
});
// profile.role is 'manager'. The person is already logged in.

// Owner's codes page:
await api.createInviteCode('manager');
const mine = await api.listInviteCodes();      // only the codes this person made, unused and not expired

// Manager's codes page:
await api.createInviteCode('worker');          // or 'technician'
const mine2 = await api.listInviteCodes();
```

The shared types `InviteCode` and `InviteRole` (from `@garmentpulse/shared`) match the shapes you already use in `fakeAccounts.ts`, so you can drop your own copies of them.

## Rules the backend enforces (you do not need to check them)

| Who | May make |
|---|---|
| Owner | `manager` codes only (anything else gives `NOT_ALLOWED`) |
| Manager | `worker` and `technician` codes only |
| Worker, technician | no codes (`NOT_ALLOWED`) |

A code is 10 letters and numbers, works once, and runs out after 7 days. `listInviteCodes` shows only the caller's own unused codes. Nobody can make an owner code.

## Errors

Your `errorSentence` already reads `error.message`, and the helper throws an `ApiError` whose message is the code, so your existing `SIGNUP_ERROR_TEXT` works as it is for `INVALID_CODE` and `EMAIL_TAKEN`. Other codes you may see from sign-up: `WRONG_PLATFORM` (a worker or technician code typed on the website), `INVALID_INPUT` (empty name, bad email, password shorter than 6), `UNKNOWN`.

## After sign-up

Do the same as after a normal login: put the profile in your login memory, give the live-update connection the login (you already do that), and open the manager page. In real mode, hide the old "fake" parts: the fake sign-up, the fake codes in the browser, and the owner code idea (`FAKE_OWNER_CODE`). Owner accounts are made by hand, never by sign-up.

## How to test

Log in as `owner@example.com` and make a manager code. Open the sign-up page in a private window and sign up with it: you should land on the manager page. The same code must then be refused. Pretend accounts you make this way stay in the project; tell me, and I will delete them.

## What I am doing meanwhile

Waiting for the first full test, then the Bangla names. If something behaves differently from this note, write a note in `requests/sakib/` with what you saw.
