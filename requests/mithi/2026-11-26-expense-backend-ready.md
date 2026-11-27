# Build the repair cost screens on the website (the backend is ready)

- From: sakib
- To: mithi
- Status: open

## What I need

Please build these website screens. This replaces my earlier "not yet" answers, for invoices and owner approval only. Everything else outside the MVP still waits.

**Start after pull request 123 is merged** (it adds the shared code). The database is already on the real project.

| Who | Screen | Calls |
|---|---|---|
| Manager | A list of repair costs with their photos, and a **Record** button (card GP-48) | `listExpenses(status?)`, `recordExpense(id)` |
| Owner | A list of costs and receipts (card GP-49) | `listExpenses(status?)`, `getExpense(id)` |
| Owner | **Approve** and **Reject** (a short reason is required to reject) | `decideExpense(id, 'approved')`, `decideExpense(id, 'rejected', reason)` |
| Owner | A box to see and set the **expense limit** | `getExpenseLimit()`, `setExpenseLimit(amount)` |

How to do it:

- All calls are in `createApi(supabase)`. The rules and exact shapes are in `docs/api-contract.md` section 4.8.
- Show a photo with `getExpensePhotoUrl(supabase, expense.receipt_path)` (and `invoice_path`). The link works for 5 minutes, so ask again each time and do not save it.
- Fake data: `FAKE_EXPENSES` (one cost for each situation) and `FAKE_EXPENSE_LIMIT`. Their photo paths point at no real file, so show a placeholder picture.
- Buttons: `canDecideExpense(e)` for Approve and Reject, `canRecordExpense(e)` for Record.
- Status words: `EXPENSE_STATUS_LABELS`. Colours: `docs/design-system.md` section 4.2.
- New error codes: `RECEIPT_REQUIRED`, `EXPENSE_NOT_APPROVED`, `EXPENSE_ALREADY_DECIDED`, `EXPENSE_ALREADY_RECORDED`. They are in their own list (`EXPENSE_ERROR_CODES`). Read failures with `getApiErrorCode` or `error.code`, **not** `getErrorCode`, and write a sentence for each in English and Bangla.
- Live updates: subscribe to the `expenses` table (give the connection the login first, as for reports).
- Until the owner sets a limit, **every** cost waits for the owner.

Please also update `apps/web/CLAUDE.md`: it still says "Not in the MVP: expense approval" and "Do not build them", and that the owner cannot approve anything. Your Claude will refuse to build these screens until those lines change. The owner still cannot change **reports**.

## Why

Cards GP-48 and GP-49 were waiting for these names.

## What I am doing meanwhile

Nothing else on expenses is planned in the backend. If a function or field is missing, write me a note and do not work around it.
