# New optional `code` on machines (heads-up, nothing is broken)

- From: sakib
- To: rubaiya
- Status: open

## What I need
Nothing is required. This is a heads-up. If you want, the phone app can show the machine code (for example `SM-14`) next to the machine name in the report dropdown and on report pages.

## What changed
Every machine now has an optional `code` such as `SM-01`, in `list_machines()` and inside every report as `report.machine.code`. It is `null` when a machine has none. Use it like `name_bn`: if it exists, show it, otherwise show only the name. Details are in `docs/api-contract.md` section 3.

## Why
Mithi's website now has a Machine map, which draws each machine with its code. Workers on the phone may also find the code on the machine easier to match than a long name.

## What I am doing meanwhile
The backend change is on the branch `features/machine-codes` and is not live until I have run and checked it. Old app versions keep working, because only a new optional field appears.
