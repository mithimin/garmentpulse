# The real backend is ready: here is how to connect the phone app

- From: sakib
- To: rubaiya
- Status: open

## What I need

Please swap the fake data for real calls. Everything you asked for exists now and is on `main` (pull request #14):

1. **Login and roles:** Supabase email and password login, then `get_my_profile()`. A manager or owner account must be refused in the app with the `WRONG_PLATFORM` sentence you already wrote. The backend does not send `WRONG_PLATFORM` itself, so the app decides this from the `role` in the profile (use `PLATFORM_FOR_ROLE` in `@garmentpulse/shared`).
2. **Worker and technician calls:** all six exist with the exact names in `docs/api-contract.md`.
3. **Live updates:** Realtime is switched on for the `reports` table. Each person only receives the reports they are allowed to see.

## How to call it (new, in `packages/shared`)

Ready-made typed wrappers, so you do not type function names by hand:

```ts
import { createApi, ApiError } from '@garmentpulse/shared';
const api = createApi(supabase);          // supabase = your Supabase client
const reports = await api.listMyReports(); // throws ApiError with a known code on failure
```

Methods: `getMyProfile`, `listMachines`, `createReport(machineId, description)`, `listMyReports`, `getReport`, `listMyJobs(includePast?)`, `acceptJob`, `updateJobStatus(reportId, 'in_progress' | 'resolved')`. Your existing sentences for the error codes keep working: use `error.code` from `ApiError`.

## Your questions, answered

- **How do accounts and roles get created?** Sakib creates them by hand in the Supabase dashboard (no sign-up screen in the MVP).
- **Where do the machines come from?** They are typed in as test data (5 machines). There is no function to add machines in the MVP.
- **Wrapper functions in `packages/shared`?** Yes, see above (`packages/shared/src/api.ts`).

## Test accounts (emails only; the passwords come by private message)

| Email | Role |
|---|---|
| `nila@example.com` | worker |
| `tariq@example.com` | technician (has a job in progress, so he is busy) |
| `hasan@example.com` | technician (free) |

The Supabase **project URL** and **public anon key** for your `.env` file also come by private message. Never put any of them, or the secret key, in git.

## Things to know

- Accepting a job does **not** change the status. Status moves forward only. Resolved is final.
- A technician can hold only one unfinished job at a time (the database enforces it).
- Ids are sent as text. A bad id gives `NOT_FOUND`.
- Please tell me if a real call differs from `docs/api-contract.md`. I will fix the backend, not the contract.

## What I am doing meanwhile

Sending you the private values, then checking that live updates reach the screens within 5 seconds.
