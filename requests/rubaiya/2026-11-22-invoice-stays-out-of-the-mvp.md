# Correction: invoice and receipt stay OUT of the MVP

- From: sakib
- To: rubaiya
- Status: done (2026-11-24: read, no invoice screen built)

## What I need
Please **do not build the invoice and receipt screen** for now. This note **replaces** `2026-11-22-invoice-is-in-the-mvp.md`, which said the opposite. That note was not my decision. Sorry for the mix-up.

## The decision (2026-11-22, Sakib)
**No. Invoice and receipt (FR-04) stay out of the MVP** (`docs/mvp.md` section 3, and section 6 now says so). We plan them after the demo.

## Why
The backend would need an invoices table, safe storage for receipt photos (with rules about who can open them), several new functions and error codes, and the owner's expense limit (FR-05). That is a lot of new, security-sensitive work (photos and money) before the demo. The demo and the second team test work without it.

## What you can do meanwhile
- If you already drew the invoice screen with fake data, keep it in `apps/mobile/` as a draft, or remove it. It must not be shown in the demo and must not call any backend function.
- Do not copy invoice fields into `packages/shared`.
- The technician screens are otherwise finished, so the next things are the second team test and your Bangla word changes (`requests/rubaiya/2026-11-02-bangla-words-confirmed-phone.md`).

## What I am doing meanwhile
Nothing on invoices. After the demo I will plan it properly and tell you in a new note, with the function names in `docs/api-contract.md`.
