# Each worker needs ONE assigned machine (the phone Home screen shows only that machine)

- From: rubaiya
- To: sakib
- Status: open

## What I need
Please add a way to say which machine belongs to which worker, and send it to the phone with `get_my_profile()`. For example, an optional `machine_id` on `profiles` that is only used for workers, and in the `Profile` shape an optional `machine` (`id`, `name`, `name_bn`, `code`, `seat`, `floor`) that is `null` when no machine is assigned. Please also give each of the test workers a machine (for example Nila gets a machine on floor 1).

## Why
Our faculty said a worker always works at the same machine, so she should not see the whole machine map. The Home screen now shows a big picture of only her own machine and what is happening to it (OK, down, technician assigned, being fixed, fixed). Today the phone does not know which machine is hers.

## What I am doing meanwhile
The phone uses the first sewing machine (code `SM-...`) of `list_machines()` as a temporary stand-in (one marked line in `apps/mobile/src/data/useMyMachine.ts`). When your field exists, I swap that one line. The colour of the picture already uses the real `list_machine_states()` and its live updates. It is fine to build this later: how a manager sets a worker's machine (a website screen, or at sign-up) can wait for a later step, and by hand in SQL is enough for the demo.
