# A Bangla speaker answered: please change these words on the phone

- From: sakib
- To: rubaiya
- Status: open

## What I need
This replaces my earlier note `2026-11-02-bangla-words-to-change-later.md`. A Bangla speaker has now answered (the answers are in Part H of `docs/bangla-review-sheet.md`). Please change these words in `apps/mobile/src/language/screenText.ts`. Only these. The rest of the sheet (Parts D, E, F) is still unread, so do not change other words yet.

| Key or place | Now | Change to |
|---|---|---|
| `fixedButton` ("Mark as fixed") | ঠিক হয়েছে | মেরামত শেষ করুন |
| `noJobs` (home card and jobs list) | খোলা কাজ | এখন কোনো বাকি কাজ নেই |
| the "No open job. Waiting for the manager." text | কোনো খোলা কাজ নেই। ম্যানেজারের অপেক্ষায়। | এখন কোনো বাকি কাজ নেই। ম্যানেজারের অপেক্ষায়। (to confirm) |
| `reportedAtLabel` (2 places) | জানানো হয়েছে | রিপোর্টের সময় |
| `reportedByLabel` | জানিয়েছেন | রিপোর্ট করেছেন |
| the text with `আমার রিপোর্ট-এ` | রিপোর্ট-এ | রিপোর্টে |
| `acceptButton` | কাজটি গ্রহণ করুন | কাজটি নিন |
| `needsAccept` and `acceptedAtLabel` | নতুন: গ্রহণ করুন / গ্রহণ করা হয়েছে | follow the accept button, for example নতুন: কাজটি নিন and কাজ নেওয়া হয়েছে (to confirm) |
| log in (everywhere) | লগ ইন | keep লগ ইন and লগ আউট; no change needed if you already use them |

## The error sentences (`ERROR_TEXT` in the same file)
Replace the Bangla of these codes with the speaker's sentences (the English stays):

| Code | Bangla |
|---|---|
| `NOT_AUTHENTICATED` | লগ ইন করা যায়নি। ইমেইল আর পাসওয়ার্ড ঠিক আছে কি না দেখে নিন। |
| `NOT_ALLOWED` | আপনার এই কাজটি করার অনুমতি নেই। |
| `NOT_FOUND` | এটা খুঁজে পাওয়া যায়নি। |
| `INVALID_INPUT` | সব ঘর পূরণ করুন। |
| `REPORT_ALREADY_ASSIGNED` | এই রিপোর্টের জন্য আগেই একজন টেকনিশিয়ান আছেন। |
| `JOB_NOT_ACCEPTED` | টেকনিশিয়ানকে আগে কাজটি নিতে হবে। |
| `JOB_ALREADY_ACCEPTED` | টেকনিশিয়ান এই কাজটি আগেই নিয়েছেন। |
| `EMAIL_TAKEN` (sign-up) | এই ইমেইল দিয়ে আগেই একটি অ্যাকাউন্ট খোলা হয়েছে। লগ ইন পেজে যান। |

Not changed: `TECHNICIAN_BUSY`, `INVALID_STATUS_CHANGE` and the "Something went wrong" sentence were said to be OK. The sign-up sentences for `INVALID_CODE` and `WRONG_PLATFORM` on the phone are phone-only (they say "manager" and "website"), so the speaker did not read them: leave them.

## Not yet answered
The sentence "This account is for the other role. Please choose the other button above." (the wrong-role message): the speaker asked for the English, and I will ask again. Leave it as it is.

## Why
A Bangla speaker read it, and these are their words.

## What I am doing meanwhile
I change the shared words in `packages/shared/src/labels.ts` (Waiting becomes অপেক্ষায়, In progress becomes কাজ চলছে), so you do not need to. The phone already reads them from there.
