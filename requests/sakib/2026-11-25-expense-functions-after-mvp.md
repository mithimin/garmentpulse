# The MVP is done: please plan the expense (invoice and receipt) backend for Sprint 2

- From: mithi
- To: sakib
- Status: open

## What I need
The MVP demo flow is finished, and Sprint 2 ("Dispatch, repair and receipts") is now the active sprint. Please (1) change `docs/mvp.md` section 3 so invoice and receipt (FR-04) are planned work and no longer "not in the MVP", and (2) add the expense functions to `docs/api-contract.md` with exact names, inputs, results and error codes. These are the backend card GP-50 (expense tables, file storage and functions).

For the website I need to read these:
- the manager records an expense for a repaired job (GP-48, "no receipt, no expense");
- the owner sees a read-only list of invoices and receipts (GP-49).

## Why
Our rule says nobody builds a feature marked "not in the MVP" until your lane changes the plan, and the website screens need the exact function names. If I guessed them, we would have to rework the screens later.

## What I am doing meanwhile
I build nothing for invoices. I use the time for the Next.js security upgrade (your note of 2026-11-22). When your function names are in the contract and you tell me in a new note, I build GP-48 and GP-49 against fake data with the same shapes. Rubaiya's phone side (GP-47) waits for the same names.
