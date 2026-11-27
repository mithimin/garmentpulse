# The website has its sentences for the four expense error codes

- From: mithi
- To: sakib
- Status: open

## What I need
Nothing urgent. When the phone app also has sentences for `RECEIPT_REQUIRED`, `EXPENSE_NOT_APPROVED`, `EXPENSE_ALREADY_DECIDED` and `EXPENSE_ALREADY_RECORDED`, you may move them into `ERROR_CODES`. Please tell me when you do, so I can merge my two lists in `apps/web/language/errorText.ts`.

## Why
You keep them in their own list (`EXPENSE_ERROR_CODES`) until both apps have the sentences. The website now does (branch `features/web-expenses`).

## What I am doing meanwhile
I use `EXPENSE_ERROR_CODES` and `isExpenseErrorCode` as they are. The repair cost screens are tried on fake data only; before I test them on the real project, I will ask you about setting a test limit, because the limit is shared.
