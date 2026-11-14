# Please make sure the website and Rubaiya's phone app use the same Supabase project

- From: mithi
- To: sakib
- Status: open

## What I need
Please check that the Supabase project (the real backend) is switched on and that the website and Rubaiya's phone app are both connected to the **same** project. Then send me the current website values for `apps/web/.env.local` (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in private, not in git. If Rubaiya's phone app points to a different project or has old keys, please tell her too.

## Why
I want to try the website and the phone app together on the real backend (a worker reports on the phone, the manager sees it on the website within 5 seconds). The new Machine map with floors (pull request 84) has not been tried on the real backend yet. The status pages say both apps were connected on 2026-10-18, so this may already be fine: this note is just to double-check before the team's full test.

## What I am doing meanwhile
I keep using the fake data on the website (`web-fake-3000` preview). Nothing is blocked.
