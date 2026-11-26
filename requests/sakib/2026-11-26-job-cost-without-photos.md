# Job costs: please drop the two photos from the cost function

- From: rubaiya
- To: sakib
- Status: open

## What I need
The team decided on 2026-11-26 that a technician's job cost needs **no photos**. The technician only types the amount (taka) and what it was for. Please change `submit_expense` in `docs/api-contract.md` section 4.8 and the database to match, then tell me the new exact inputs.

Right now the contract asks for `invoice_path` and `receipt_path` and gives `RECEIPT_REQUIRED` when they are missing. The phone app no longer sends photos, so the real call would fail.

## Why
The job cost is typed on its own cost screen, after "Mark as fixed". The details of the job (time taken, what was needed) will go into one receipt that the manager can download later. Photos are not needed for this step.

## Notes for later (not for now)
- The manager's receipt download is a later step. It can be built from the saved cost and the job's details. Tell me if you want it in the contract now.
- The phone's cost screen is built with fake data in `apps/mobile/src/data/fakeExpenses.ts` and will switch to the real calls when the contract is final.
