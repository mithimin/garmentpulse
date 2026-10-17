# The real backend is ready for the website

- From: sakib
- To: mithi
- Status: open

## What I need

You can build the manager and owner screens against the **real backend** now, not only the fake data. It is on `main` (pull request #14). Please start with the steps in `apps/web/STATUS.md`. When you want real data, use the ready-made wrappers in `packages/shared`:

```ts
import { createApi, ApiError } from '@garmentpulse/shared';
const api = createApi(supabase);   // supabase = your Supabase client
```

| Screen | Wrapper | Notes |
|---|---|---|
| Manager: all reports | `api.listReports(status?)` | newest first |
| Manager: technicians free/busy | `api.listTechnicians()` | `availability` is `free` or `busy` |
| Manager: assign | `api.assignTechnician(reportId, technicianId)` | can fail with `TECHNICIAN_BUSY`, `REPORT_ALREADY_ASSIGNED` |
| Manager: worker's machine dropdown data | `api.listMachines()` | |
| Owner: three count boxes | `api.getOwnerSummary()` | |
| Owner: report list | `api.listReports(status?)` | read-only |
| After login | `api.getMyProfile()` | the `role` decides the screen |

## Why

Your screens no longer need to wait for the backend. The names, inputs and error codes match `docs/api-contract.md` exactly, and the wrappers throw an `ApiError` with a known `code` that you turn into a friendly sentence (English and Bangla).

## Things to know

- The website is for **manager and owner only**. Use `PLATFORM_FOR_ROLE` in `@garmentpulse/shared`: a worker or technician who logs in on the web gets the `WRONG_PLATFORM` message from the app.
- Live updates (Realtime) are on for the `reports` table. A new report should reach the manager's list within 5 seconds.
- There is no reassign in the MVP, and no auto-assign: the manager always chooses. A queued report is `waiting` with `technician` null (`isInQueue` helper).
- Test logins: `farhan@example.com` (manager) and `owner@example.com` (owner). The passwords, the Supabase **project URL** and the **public anon key** come by private message. Never put them in git.

## What I am doing meanwhile

Sending the private values to Rubaiya and you, then checking that live updates arrive within 5 seconds.
