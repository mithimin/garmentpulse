# Question: should invoice and receipt (FR-04) move into the MVP, and what would the backend need?

- From: rubaiya
- To: sakib
- Status: open

## What I need
A decision from you, please. Our technician screens are finished except for the invoice and receipt screen. Today it is on the "not in the MVP" list (`docs/mvp.md` section 3), so I will NOT build it until you say the plan changes. Can you say yes or no, and if yes, which backend pieces you would build?

## Why
The PRD says a technician sends an invoice with a receipt after a repair that costs money (FR-04: "No receipt, no expense"). A phone screen for it is easy to draw, but it only works if the backend can keep the invoices and the receipt photos. I do not want to build a screen that has nowhere to send its data.

## The screen I would build (a picture mock-up is in our chat, I can share it)
On a job page, an "Add cost" button opens a form:
1. The machine and job at the top.
2. The amount in taka (a big number box) and "What was it for?" (picture chips such as spare part, needle, motor, service) plus an optional note.
3. A receipt photo: "Take a photo of the receipt" or "Choose from gallery", with a small preview and "Retake". No photo means the Send button stays off.
4. "Send to manager". After that, a status label with a word and a colour: Sent, Manager checking, Waiting for owner (only for big costs), Approved, Rejected.
5. The technician can see his past invoices in a list.

## What the backend would need (my guess, you decide)
- A table for invoices (job, technician, amount, reason, note, status, dates).
- A place to store receipt photos, with rules so only the technician, the manager and the owner can open them.
- Functions such as `create_invoice`, `list_my_invoices`, and for the web: `list_invoices`, `review_invoice` (manager), `decide_invoice` (owner, for big costs).
- New error codes, for example for a missing receipt or an amount that is too big.
- The owner's expense limit (FR-05) if big costs must wait for the owner. This could come later if we only do the technician and manager part first.

## What I am doing meanwhile
Nothing is built. I keep working on other screens and use fake data only for what is already in the MVP. If you say yes, I will first wait for the function names in `docs/api-contract.md`, then build the screen against fake data with the same shapes.
