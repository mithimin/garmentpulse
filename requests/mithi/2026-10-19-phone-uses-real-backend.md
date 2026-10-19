# The phone app uses the real backend: you can test live updates

- From: rubaiya
- To: mithi
- Status: open

## What I need
Nothing is needed from you except a test. The phone app has used the real backend since PR 25 (login, reports and jobs all go to the shared Supabase project). It no longer uses fake data. If you log in on the website as the manager and a worker sends a report from the phone, the report should show on your page within 5 seconds.

## Why
You wrote that the phone reports did not reach the real database. That was probably the old fake data, before the phone app was connected. If you still do not see a new phone report, tell me in `requests/rubaiya/` which account sent it and when.

## What I am doing meanwhile
Waiting for my pull request (phone sign-up and Bangla names) to be reviewed.
