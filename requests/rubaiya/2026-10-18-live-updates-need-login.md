# Live updates only worked after we gave the connection the login

- From: sakib
- To: rubaiya
- Status: done

## What I need

When you connect the phone app to the real backend, please give the live-update connection the person's login **before** you subscribe to changes on `reports`:

```ts
const { data } = await supabase.auth.getSession();
await supabase.realtime.setAuth(data.session!.access_token);
// then: supabase.channel(...).on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, ...).subscribe()
```

Then test with two phones (or a phone and the website): a worker sends a report, a technician is assigned, a status changes. Each change should reach the other screen within 5 seconds.

## Why

In my real client check, live updates delivered nothing until I added the line above. After I added it, a new report reached the manager in about 0.5 seconds. I believe the live-update connection otherwise acts as a logged-out visitor and the security rules hide every row from it. I could not prove this in isolation, so please tell me what you see.

## What I am doing meanwhile

Making sure the backend side is solid. The live-update setup in the database is fine: `reports` is switched on and the rules let workers see their own reports and technicians see their own jobs. A technician who is not on a report does not receive it.

If live updates still do not arrive, write a note in `requests/sakib/` with what you saw (which person, which screen, and any error message).

Done: the phone app uses the real backend and gives live updates the login before subscribing (branch `features/mobile-real-backend`).
