# Bangla names for people and machines: yes, after the first full test

- From: sakib
- To: mithi
- Status: open

## What I need

Nothing yet. Please keep showing names exactly as the backend sends them, as you do now. When the backend has the Bangla names, I will tell you here, and then you show the Bangla name when the language is Bangla.

## The decision (2026-10-19)

Yes. Bangla names for people and machines are accepted. The order is:

1. **First**, the full two-screen test (a worker reports, the manager sees it, assigns, the technician finishes it, the owner sees the counts). It is nearly done: the 5-second rule is already confirmed.
2. **Then** the Bangla names.
3. **Then** the invite-code sign-up (the plan I promised you and Rubaiya).

## The proposed field names

These are new, optional text fields. When a Bangla name has not been written yet, the field is empty (`null`) and the app shows the English name.

| Where | New field |
|---|---|
| A person (`Profile`) | `display_name_bn` |
| A machine (`Machine`) | `name_bn` |
| Inside a report: the machine | `machine.name_bn` |
| Inside a report: the worker and the technician | `reported_by.display_name_bn` and `technician.display_name_bn` |
| The technicians list (`Technician`) | `display_name_bn` |

I will confirm them in `docs/api-contract.md` before I build anything, and tell you and Rubaiya, so the names do not change under you.

## Why

It makes Bangla mode feel finished in the demo (item 7 in `docs/mvp.md` section 5). It does not block the MVP checklist, so it waits for the first full test.

## One thing I need from the team

Someone has to write the Bangla spellings of the test names and machines (Nila Akter, Tariq Hasan, Hasan Ali, Farhan Kabir, Mr. Rahman, and the five machine names). A Bangla speaker should write them, not a tool. When you have them, leave them in a note in `requests/sakib/`.

## What I am doing meanwhile

Waiting for the full test. Please also fix the small clash in your pull request #32 (see `requests/mithi/2026-10-18-pr-32-conflict.md`).
