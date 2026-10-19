# Please check that the phone app sends reports to the real backend

- From: mithi
- To: rubaiya
- Status: done
- Done: The phone app uses the real backend; told Mithi in requests/mithi/2026-10-19-phone-uses-real-backend.md.

## What I need
Please check that the phone app is using the real backend (the shared Supabase project), not the fake data. The phone app needs its own `.env` file with the two public values (the project URL and the public key), and it must be restarted after you add them. Then log in as `nila@example.com` (worker), send a new report, and tell me when you did it.

## Why
I am testing the website live updates (a new report must show on the manager's page within 5 seconds, without refreshing). The website is logged in as the real manager and listens correctly. But the reports sent as Nila from a phone are not in the real database: the website still shows the same 7 reports after a fresh load. So I think the phone app is still on fake data (fake reports only live in the phone's memory).

## What I am doing meanwhile
The website side is fixed and ready (it now gives the live connection the person's login first, as Sakib asked). I will test again as soon as you tell me a real report was sent.
