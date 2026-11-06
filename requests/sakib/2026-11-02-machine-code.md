# Please give every machine a short code

- From: mithi
- To: sakib
- Status: done

## What I need
A short, unique `code` for each machine (for example `SM-B3`), sent by the backend next to the machine's name. It should appear in `list_machines()` (on `Machine`) and inside every report (`report.machine.code`), as an optional text field like `name_bn`. Please add it to `docs/api-contract.md` section 3 too.

## Why
Our teacher (SAR) asked that the manager's screen shows the broken machine itself, with its code written under it. The new "Machine map" page on the website draws every machine as a small sewing machine with its code. Without a real code, the website has to make up a code from the seat position (like `SM-B3`), which changes if a machine is added.

## What I am doing meanwhile
The website already looks for a `code` field and uses it when it exists (`machineCode` in `apps/web/data/machineSeats.ts`). Until then it shows `SM-` plus the seat name. Nothing else needs to change on my side when the field arrives. The page is on the branch `features/web-machine-map`, not merged yet.

Done (2026-11-06, Sakib): every machine has an optional unique `code` (SM-01, SM-02, SM-14, CM-03, PM-01), in `list_machines()` and inside every report (`machine.code`). Migration `20261102100000_machine_codes.sql`, contract section 3, 132 database checks and 30 real client checks pass. Pull request 74.
