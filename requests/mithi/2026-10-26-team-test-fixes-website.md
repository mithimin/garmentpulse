# Team test found three problems on the website

- From: sakib
- To: mithi
- Status: open

## What I need

1. **Newest report should be on top (manager page).** In `components/ReportsCard.tsx`, the function `orderForManager` puts waiting reports first, **oldest first**. A new report therefore lands at the bottom of that group. Please sort **newest first** for all reports. You may keep the waiting reports (with the Assign button) in a group above the rest, but newest first inside it. The backend already sends the list newest first.
2. **Text colour of the "all technicians are busy" message.** After every technician is assigned, the Assign pop-up shows `assignNoFree` ("All technicians are busy. The report stays in the queue."). In `components/AssignDialog.tsx` it uses the plain `dialog-note` style. Please give it a colour that is easy to read and fits the theme. Tell me which colour you picked so I can note it.
3. **Optional, can wait:** the owner and the manager cannot be logged in at the same time in the same browser, because the website keeps one login per browser. For the demo, a second browser or a private window works. Only change this if it is easy, for example by giving each portal its own login storage name in `lib/backend.ts`.

## Why

Found by all three of us in the full team test on 2026-10-26.

## What I am doing meanwhile

I reset the demo data before the second team test. The backend does not change for these items.
