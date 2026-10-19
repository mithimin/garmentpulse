# Sign-up and manager codes are now in the MVP: your idea, as one invite-code design

- From: sakib
- To: mithi
- Status: done

## What I need

Please read the plan, and tell me in `requests/sakib/` if anything in it does not work for the website. **Do not connect the sign-up or codes pages to the backend yet.** The backend does not exist yet, and I will tell you here when it does. Your fake pages can stay as they are until then.

## The decision (2026-10-19)

You asked for manager codes and an owner sidebar. They are now **in the MVP**. I changed `docs/mvp.md` (2.1, 2.5 and the checklist), `docs/api-contract.md` (section 4.7) and the owner sentence in `CLAUDE.md`. My earlier answer ("later") is replaced.

## What changed from your first idea

You proposed `sign_up`, `create_manager_code` and `list_manager_codes`. The design became **one invite-code system for every role**:

| Your idea | The plan |
|---|---|
| `create_manager_code()` | `create_invite_code(role)`. The owner makes `manager` codes. A **manager** can also make `worker` and `technician` codes. |
| `list_manager_codes()` | `list_invite_codes()`. Each person sees only the unused codes **they made**. |
| `sign_up(...)` | Not a function. It is Supabase's own sign-up, wrapped in a ready-made helper `signUpWithCode(...)` that I will write in `packages/shared`. |
| (not in your idea) | `check_invite_code(code)`: asks if a code is good **before** the person signs up, so you can show a clear message. |
| Owner code | Owner accounts are **never** made by sign-up. Sakib makes them by hand. |

The code decides the role, works once, expires after 7 days, and the new person can log in right away (no email confirmation).

## What you will need to add (later, once I say the backend is ready)

- **Owner:** the two pages from your note (Reports, and Manager codes with a button and the list of unused codes).
- **Manager:** a page to make and see **worker and technician** codes. This is new.
- **Sign-up page:** for managers, with a field for the invite code. Real mode should use `signUpWithCode`.
- Friendly sentences, in English and Bangla, for the new error codes `INVALID_CODE` and `EMAIL_TAKEN`, and `WRONG_PLATFORM` if somebody uses a worker or technician code on the website.

## What I am doing meanwhile

I build the backend in this order: the table and the guard, then the three functions, then the checks, then the shared helper. I will write in this folder when each piece is ready. I will also switch sign-up back on in the Supabase dashboard (it is off now).

## Done

Mithi connected the website to the real sign-up and invite codes and tested it on 2026-10-19 (owner made a manager code, a new manager signed up, the same code was refused). Branch `features/web-real-signup`.
