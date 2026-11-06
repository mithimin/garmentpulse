# A Bangla speaker answered: please change these words on the website

- From: sakib
- To: mithi
- Status: open

## What I need
This replaces my earlier note `2026-11-02-bangla-words-to-change-later.md`. A Bangla speaker has now answered (the answers are in Part H of `docs/bangla-review-sheet.md`). Please change these words in `apps/web/language/screenText.ts` and `apps/web/language/errorText.ts`. Only these. The rest of the sheet (Parts D, E, F) is still unread, so do not change other words yet.

| Key | Now | Change to |
|---|---|---|
| `assignTitle` | টেকনিশিয়ান নিয়োগ দিন | টেকনিশিয়ান পাঠান |
| `assignButton` | নিয়োগ দিন | পাঠান (to confirm: the speaker wrote "টেকনিশিয়ান পাঠান" for both) |
| `assignSelected` (Machine map) | টেকনিশিয়ান দিন | টেকনিশিয়ান পাঠান |
| `assigning` | নিয়োগ হচ্ছে... | পাঠানো হচ্ছে... (to follow the button) |
| `labelFreeTechnicians`, `assignFreeTag`, the technicians help line | ফ্রি | খালি |
| `codeValidUntil` | মেয়াদ শেষ | মেয়াদ: ... পর্যন্ত (the date goes in the middle, for example মেয়াদ: ৭ নভেম্বর পর্যন্ত) |
| `filterName` | রিপোর্ট ছাঁকুন | রিপোর্ট ফিল্টার করুন |
| `colReportedBy` | রিপোর্টকারী | রিপোর্ট করেছেন |
| `seatAssigned` | টেকনিশিয়ান ঠিক হয়েছে | টেকনিশিয়ান দেওয়া হয়েছে |
| `noCodes` | এখনো কোনো অব্যবহৃত কোড নেই। | এখন ব্যবহার করার মতো কোনো কোড নেই। |
| `mapSub` | ফ্লোরের প্রতিটি মেশিন। লাল রঙে জ্বলতে থাকা মেশিনে টেকনিশিয়ান লাগবে। | ফ্লোরের প্রতিটি মেশিন। যে মেশিনের চিহ্নটি লাল হয়ে ঝলকাচ্ছে, সেখানে টেকনিশিয়ান লাগবে। (to confirm) |
| `loginLink`, `chooseRole` (they use লগইন) | লগইন | লগ ইন, like the other places |
| the line with "চলমান" (`ownerLine`) | {progress}টি চলমান | {progress}টি কাজ চলছে (the speaker changed "In progress" to কাজ চলছে) |
| the line with "অপেক্ষায়" | অপেক্ষায় | no change (the speaker's new word for Waiting is the same) |

## The error sentences (`errorText.ts`)
Replace the Bangla of these codes with the speaker's sentences:

| Code | Bangla |
|---|---|
| `NOT_AUTHENTICATED` | লগ ইন করা যায়নি। ইমেইল আর পাসওয়ার্ড ঠিক আছে কি না দেখে নিন। |
| `WRONG_PLATFORM` | এই ওয়েবসাইটটি শুধু ম্যানেজার ও মালিকের জন্য। এর বদলে ফোনের অ্যাপ ব্যবহার করুন। |
| `NOT_ALLOWED` | আপনার এই কাজটি করার অনুমতি নেই। |
| `NOT_FOUND` | এটা খুঁজে পাওয়া যায়নি। |
| `INVALID_INPUT` | সব ঘর পূরণ করুন। |
| `REPORT_ALREADY_ASSIGNED` | এই রিপোর্টের জন্য আগেই একজন টেকনিশিয়ান আছেন। |
| `JOB_NOT_ACCEPTED` | টেকনিশিয়ানকে আগে কাজটি নিতে হবে। |
| `JOB_ALREADY_ACCEPTED` | টেকনিশিয়ান এই কাজটি আগেই নিয়েছেন। |
| `EMAIL_TAKEN` | এই ইমেইল দিয়ে আগেই একটি অ্যাকাউন্ট খোলা হয়েছে। লগ ইন পেজে যান। |
| `INVALID_CODE` | কোডটি ভুল, আগেই ব্যবহার করা হয়েছে, অথবা এর মেয়াদ শেষ। মালিকের কাছ থেকে নতুন কোড নিন। |

Not changed: `TECHNICIAN_BUSY`, `INVALID_STATUS_CHANGE` and the "Something went wrong" sentence were said to be OK.

## Why
A Bangla speaker read it, and these are their words.

## What I am doing meanwhile
I change the shared words in `packages/shared/src/labels.ts` (Waiting becomes অপেক্ষায়, In progress becomes কাজ চলছে), so you do not need to. I also update the Bangla name of the owner in the backend.
