-- =============================================================================
-- Migration: each worker has ONE assigned machine
-- =============================================================================
-- Asked for by Rubaiya (requests/sakib/2026-11-21-worker-assigned-machine.md).
-- Our faculty said a worker always works at the same machine, so the phone's Home
-- screen shows only that machine. Until now the backend did not know which machine
-- belongs to which worker, so the phone showed the same machine to everybody.
--
-- What this does, in plain words:
--   1. Adds an optional column `machine_id` to `profiles` (a new empty box on each
--      person's card for "my machine"). It is empty (null) until someone fills it.
--   2. Two rules, enforced by the database itself:
--        * only a WORKER may have a machine (a technician, manager or owner cannot);
--        * one machine belongs to at most ONE worker (no two workers share it).
--      Many people may have no machine at all (null does not count as a shared value).
--   3. Changes get_my_profile() so it also sends `machine`: the worker's machine
--      (id, name, name_bn, code, seat, floor), or null when none is assigned.
--      Nothing else in the answer changes.
--
-- How a worker gets a machine in the MVP: by hand in SQL (for example
-- `update public.profiles set machine_id = ... where email = ...`). A screen for
-- managers can come later. A worker who signs up with a code has no machine until
-- somebody assigns one, and the phone then shows "No machine assigned yet".
--
-- A new migration, never an edit of an old one. Safe to run once.
-- =============================================================================

-- 1. The new column. If the machine row is ever deleted, the worker simply has no
--    machine again (set null) instead of the delete failing.
alter table public.profiles
  add column machine_id uuid references public.machines (id) on delete set null;

-- 2a. One machine, one worker. A unique rule ignores empty (null) values, so any
--     number of people can have no machine.
alter table public.profiles
  add constraint profiles_machine_id_key unique (machine_id);

-- 2b. Only a worker can have a machine.
alter table public.profiles
  add constraint profiles_machine_only_for_workers
  check (machine_id is null or role = 'worker');


-- 3. get_my_profile(): the same answer as before, plus `machine`.
--    (`create or replace` keeps the function's permissions: signed-in people only.)
create or replace function public.get_my_profile()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles;
  v_machine public.machines;
begin
  if (select auth.uid()) is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select * into v_profile from public.profiles where id = (select auth.uid());
  if not found then
    raise exception 'NOT_ALLOWED';
  end if;

  if v_profile.machine_id is not null then
    select * into v_machine from public.machines where id = v_profile.machine_id;
  end if;

  return jsonb_build_object(
    'id', v_profile.id,
    'display_name', v_profile.display_name,
    'display_name_bn', v_profile.display_name_bn,
    'email', v_profile.email,
    'role', v_profile.role,
    -- null when no machine is assigned
    'machine', case
      when v_profile.machine_id is null or v_machine.id is null then null
      else jsonb_build_object(
        'id', v_machine.id,
        'name', v_machine.name,
        'name_bn', v_machine.name_bn,
        'code', v_machine.code,
        'seat', v_machine.seat,
        'floor', v_machine.floor
      )
    end
  );
end;
$$;
