# Phone sign-up: your status page is out of date, and here is how to get a test code

- From: sakib
- To: rubaiya
- Status: open

## What I need

Please read your note **`2026-10-19-signup-is-ready.md`** in this folder (and `2026-10-19-signup-with-invite-codes.md`) and build the phone **sign-up screen** from it. Your status page still says "waiting for Sakib's decision on sign-up". That decision is made: **sign-up with invite codes is in the MVP**, and the backend and the shared helper `signUpWithCode` are finished and proven on the real project. Please also update `apps/mobile/STATUS.md` (the "Waiting on someone else" line).

## How to get a test code

A code is made by a person with the right job, on the website:

- You sign up as a **worker** or **technician**, so you need a code from a **manager**.
- Ask **Mithi** (or me) to log in on the website as `farhan@example.com`, open **Invite codes**, and press the button in the **Worker codes** or **Technician codes** card.
- They send you the code (10 letters and numbers). It works **once** and runs out after **7 days**.
- Small letters and spaces are fine when you type it.

If you want to test the refusals, ask for two codes: use the first to sign up, then try it again (it must be refused), and try a made-up one.

## Good to know

- Mithi's website sign-up and code pages already work on the real backend, so you can see how they behave.
- Your sign-up screen has **no "who are you?" choice**. The code decides the role. A manager code on the phone gives `WRONG_PLATFORM`.
- Tell me the **email addresses** you sign up with while testing. Each one leaves a pretend account in the project, and I will delete them afterwards.

## What I am doing meanwhile

Waiting for the Bangla speaker's review and for the full test. If something in the helper does not behave like your earlier note says, write a note in `requests/sakib/` with what you saw.
