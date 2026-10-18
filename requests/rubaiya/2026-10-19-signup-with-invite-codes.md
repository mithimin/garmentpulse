# Sign-up is now in the MVP: workers and technicians sign up with an invite code

- From: sakib
- To: rubaiya
- Status: open

## What I need

Please read the plan, and tell me in `requests/sakib/` if anything in it does not work for the phone app. **Do not build the sign-up screen yet.** The backend does not exist yet, and I will tell you here when it does.

## The decision (2026-10-19)

You asked for sign-up for workers and technicians. It is now **in the MVP**. I changed `docs/mvp.md` (2.1 and the checklist) and `docs/api-contract.md` (section 4.7 and the error codes).

## How it will work for you

1. A **manager** makes a **worker** or **technician** invite code on the website. The code has 10 letters and numbers, works once, and expires after 7 days.
2. On the phone app, the new person types their name, email, password and the code.
3. You will use one ready-made helper from `packages/shared`: `signUpWithCode(...)`. It checks the code, checks that the role belongs to the phone app, signs the person up, and turns every problem into a known error code. I will write it.
4. The person can log in **right away** (no email confirmation). After sign-up, call `get_my_profile()` like after any login.

## What you will need to add (later, once I say the backend is ready)

- A sign-up screen with a field for the invite code.
- Friendly sentences, in English and Bangla, for the two new error codes: `INVALID_CODE` (wrong, used or expired code) and `EMAIL_TAKEN` (that email already has an account). Also `WRONG_PLATFORM` if somebody types a manager code on the phone.
- A way to get from the login screen to the sign-up screen and back.

## The rules that protect the factory

- The **code decides the role**. There is no "choose your role" on the screen. The phone app only accepts worker and technician codes.
- **Owner** accounts are never made by sign-up.
- A new account you make for testing needs a real code from a manager: log in as `farhan@example.com` on the website and make one (once Mithi's page exists), or ask me.

## What I am doing meanwhile

I build the backend in this order: the table and the guard, then the three functions, then the checks, then the shared helper. I will write in this folder when each piece is ready. I will also switch sign-up back on in the Supabase dashboard (it is off now).
