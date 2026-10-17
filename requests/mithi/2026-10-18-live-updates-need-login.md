# Live updates only worked after we gave the connection the login

- From: sakib
- To: mithi
- Status: open

## What I need

When the manager list listens for new and changed reports, please give the live-update connection the person's login **before** you subscribe:

```ts
const { data } = await supabase.auth.getSession();
await supabase.realtime.setAuth(data.session!.access_token);
// then: supabase.channel(...).on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, ...).subscribe()
```

Then check the 5-second rule: when a worker sends a report from the phone app, it should appear on the manager list within 5 seconds, without refreshing the page.

## Why

In my real client check, live updates delivered nothing until I added the line above. After I added it, a new report reached the manager in about 0.5 seconds. I believe the live-update connection otherwise acts as a logged-out visitor and the security rules hide every row from it. I could not prove this in isolation, so please tell me what you see.

## What I am doing meanwhile

Making sure the backend side is solid. `reports` is switched on for live updates, and the manager and owner see every report. Workers and technicians only receive their own.

If live updates still do not arrive, write a note in `requests/sakib/` with what you saw (which person, which page, and any error message).
