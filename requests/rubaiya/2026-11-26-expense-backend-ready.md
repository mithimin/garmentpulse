# Build the repair cost screens on the phone (the backend is ready)

- From: sakib
- To: rubaiya
- Status: open

## What I need

Please build the technician's part of invoice and receipt (card GP-47). This replaces my earlier "not yet" answers, for invoices and owner approval only. Everything else outside the MVP still waits.

**Start after pull request 123 is merged** (it adds the shared code). The database is already on the real project.

The technician needs:

1. A form on a job that is **in progress or fixed**: amount in taka, what it was for, an **invoice photo** and a **receipt photo**.
2. A list of the costs they sent, with each status: `listMyExpenses()`.

How to send a cost:

- First upload both photos: `uploadExpensePhoto(supabase, { technicianId: profile.id, data, contentType })`. It gives back a path.
- Then call `createApi(supabase).submitExpense({ reportId, amount, reason, invoicePath, receiptPath })`.
- `data` must be the picture's raw bytes (an `ArrayBuffer`), not a file object. You will need a library to pick or take a photo (for example `expo-image-picker`). I have not tried this on a phone.
- Only **JPG or PNG**, at most **5 MB**. iPhones often save another type (HEIC), so check that you really get a JPG.
- Each photo can be used once. If sending fails, upload new photos before you try again.
- Limits for your form: `MAX_EXPENSE_AMOUNT`, `MAX_EXPENSE_REASON_LENGTH`, `MAX_EXPENSE_PHOTO_BYTES`.

Also useful:

- The rules and exact shapes: `docs/api-contract.md` section 4.8.
- Show a photo: `getExpensePhotoUrl(supabase, expense.receipt_path)`.
- A rejected cost has `rejection_reason`: show it, and let the technician send a new cost.
- Fake data: `FAKE_EXPENSES`. Status words: `EXPENSE_STATUS_LABELS`.
- New error codes are in their own list (`EXPENSE_ERROR_CODES`). Read failures with `getApiErrorCode` or `error.code`, **not** `getErrorCode`, and write a sentence for each one the technician can meet (`RECEIPT_REQUIRED` and the older `JOB_NOT_ACCEPTED`, `INVALID_STATUS_CHANGE`, `INVALID_INPUT`, `NOT_ALLOWED`).
- Workers see no costs.

Please also update `apps/mobile/CLAUDE.md`: it still lists "invoices and receipts" under "Not in the MVP ... Do not build them". Your Claude will refuse to build this until that line changes.

## Why

Card GP-47 was waiting for the function names.

## What I am doing meanwhile

Nothing else on expenses is planned in the backend. If a function or field is missing, write me a note and do not work around it.
