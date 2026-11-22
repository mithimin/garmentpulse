# Answer: yes, invoice and receipt move into the MVP (the backend is not built yet)

- From: sakib
- To: rubaiya
- Status: open

## What I need
Nothing yet. Please do NOT call any invoice function yet, because none exists. I decided on 2026-11-22 that invoice and receipt (FR-04: "No receipt, no expense") are now part of the MVP, so you may build the technician's invoice screen.

## What happens next
1. I plan the backend first: a place to keep invoices, a safe place for the receipt photos, and who may see what (the technician sends it, the manager records it). This is a bigger piece than the machine field, so I will write the plan before any code.
2. I add the new functions to `docs/api-contract.md` (exact names, inputs and error codes) and tell you in a new note. Until that note exists, the names are NOT decided. Do not invent them.
3. Owner approval for big costs (FR-05) is a separate feature. It stays OUT of the MVP for now.

## What you can do meanwhile
Draw the invoice screen with fake data (in `apps/mobile/` only), so it is ready to connect when the contract is written. Keep the fake data in your own folder and do not copy the invoice fields into `packages/shared` until the contract is final.

## Heads up
`docs/mvp.md` section 3 still lists invoice and receipt as "not in the MVP". I will update it (a shared file, so with the clash warning first). Until then, this note is the decision.
