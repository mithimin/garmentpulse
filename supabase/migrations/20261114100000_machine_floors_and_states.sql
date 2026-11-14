-- =============================================================================
-- Migration 14: a floor for every machine, and the live state of every machine
-- =============================================================================
-- What this file does, in plain words:
--   1. FLOOR. Adds ONE new optional column to the machines table: `floor`, a whole
--      number from 1 to 99 (floor 1, floor 2 ...). The 5 machines that exist today
--      go on floor 1. It travels in the machine list and in every report, like
--      `code` and `seat`.
--   2. MACHINE STATES. Adds a small new table, `machine_states`, with exactly two
--      columns: `machine_id` and `state`. The state is one of four words:
--         ok           the machine has no open report
--         down         a report is waiting and NO technician is assigned yet
--         waiting      a technician is assigned but has not started
--         in_progress  the technician is working on it
--      A resolved report means `ok` again. If a machine has several open reports,
--      the one that is furthest along wins: in_progress, then waiting, then down.
--   3. The table keeps ITSELF up to date. A trigger (an automatic helper) on the
--      reports table recalculates a machine's state every time a report is
--      created, changed or deleted. Nobody, and no app, can write to the table.
--   4. Every logged-in person can READ the table, and live updates (Realtime) are
--      switched on for it, so a worker's machine map changes within 5 seconds when
--      a machine goes down. The table holds NO report text and NO names, so it
--      cannot leak anything private (workers may not read other people's reports).
--   5. A new function, `list_machine_states()`, gives the first load of the map to
--      all four roles.
--
-- Why: Rubaiya's worker machine map (requests/sakib/2026-11-14-worker-machine-map.md).
--
-- Nothing else changes: the same function names, inputs, permissions and error
-- codes. Only extra fields appear in the results, so the apps keep working before
-- and after this file. "create or replace" keeps the existing permissions.
--
-- Rules for this folder (see supabase/CLAUDE.md):
--   * Never edit an old migration. Add a NEW file for every change.
--   * Row Level Security is on for every table, and apps never write tables.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. The floor
-- -----------------------------------------------------------------------------
-- Either empty or a whole number from 1 to 99. The table stays locked: this
-- column inherits the lock.
alter table public.machines
  add column floor integer
  check (floor is null or floor between 1 and 99);

-- The machines that exist today are all on floor 1.
update public.machines set floor = 1 where floor is null;


-- -----------------------------------------------------------------------------
-- 2. The machine states table (locked, read-only for logged-in people)
-- -----------------------------------------------------------------------------
create table public.machine_states (
  machine_id uuid primary key references public.machines (id) on delete cascade,
  state      text not null check (state in ('ok', 'down', 'waiting', 'in_progress'))
);

alter table public.machine_states enable row level security;

-- Locked by default: nobody can do anything, then we give back READ ONLY.
revoke all on public.machine_states from anon, authenticated;
grant select on public.machine_states to authenticated;

-- Every logged-in person may read every row. It only holds a machine id and one
-- of four words. There is no policy for insert, update or delete, so nobody can
-- write: only the helper functions below (which run with the owner's rights) do.
create policy machine_states_select_everyone
  on public.machine_states
  for select
  to authenticated
  using (true);

-- Live updates: a change to a machine's state reaches every open map.
alter publication supabase_realtime add table public.machine_states;


-- -----------------------------------------------------------------------------
-- 3. Work out the state of one machine from its reports
-- -----------------------------------------------------------------------------
create function public.compute_machine_state(p_machine_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select case
        when bool_or(r.status = 'in_progress') then 'in_progress'
        when bool_or(r.status = 'waiting' and r.technician_id is not null) then 'waiting'
        when bool_or(r.status = 'waiting' and r.technician_id is null) then 'down'
      end
      from public.reports r
      where r.machine_id = p_machine_id
        and r.status <> 'resolved'
    ),
    'ok'
  );
$$;

-- Save the state of one machine. It writes only when the state really changed,
-- so the live updates do not send the same news twice.
create function public.refresh_machine_state(p_machine_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_machine_id is null then
    return;
  end if;
  if not exists (select 1 from public.machines where id = p_machine_id) then
    return;
  end if;

  insert into public.machine_states (machine_id, state)
  values (p_machine_id, public.compute_machine_state(p_machine_id))
  on conflict (machine_id) do update
    set state = excluded.state
    where public.machine_states.state is distinct from excluded.state;
end;
$$;

-- Nobody calls these two by hand: only the triggers below. Locked for everyone.
revoke all on function public.compute_machine_state(uuid) from public, anon, authenticated;
revoke all on function public.refresh_machine_state(uuid) from public, anon, authenticated;


-- -----------------------------------------------------------------------------
-- 4. The triggers that keep the table up to date by themselves
-- -----------------------------------------------------------------------------
-- When a report is created, changed or deleted, recalculate its machine (and the
-- old machine too, in case a report was moved).
create function public.reports_refresh_machine_state()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    perform public.refresh_machine_state(old.machine_id);
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    perform public.refresh_machine_state(new.machine_id);
  end if;
  return null;
end;
$$;

create trigger reports_refresh_machine_state
  after insert or update or delete on public.reports
  for each row execute function public.reports_refresh_machine_state();

-- A brand new machine starts as `ok`.
create function public.machines_start_machine_state()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.refresh_machine_state(new.id);
  return null;
end;
$$;

create trigger machines_start_machine_state
  after insert on public.machines
  for each row execute function public.machines_start_machine_state();

revoke all on function public.reports_refresh_machine_state() from public, anon, authenticated;
revoke all on function public.machines_start_machine_state() from public, anon, authenticated;

-- The machines and reports that exist today get their state now.
insert into public.machine_states (machine_id, state)
select m.id, public.compute_machine_state(m.id)
from public.machines m
on conflict (machine_id) do nothing;


-- -----------------------------------------------------------------------------
-- 5. The first load of the map: one row per machine, nothing else
-- -----------------------------------------------------------------------------
create function public.list_machine_states()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.require_role(
    array['worker', 'technician', 'manager', 'owner']::public.user_role[]
  );

  return (
    select coalesce(
      jsonb_agg(
        jsonb_build_object('machine_id', s.machine_id, 'state', s.state)
        order by m.name
      ),
      '[]'::jsonb
    )
    from public.machine_states s
    join public.machines m on m.id = s.machine_id
  );
end;
$$;

revoke all on function public.list_machine_states() from public, anon;
grant execute on function public.list_machine_states() to authenticated;


-- -----------------------------------------------------------------------------
-- 6. The floor travels with the machine: in every report and in the machine list
-- -----------------------------------------------------------------------------
-- Same as migration 13, plus `floor`.
create or replace function public.report_json(p_report public.reports)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', p_report.id,
    'machine', (
      select jsonb_build_object(
        'id', m.id, 'name', m.name, 'name_bn', m.name_bn,
        'code', m.code, 'seat', m.seat, 'floor', m.floor
      )
      from public.machines m
      where m.id = p_report.machine_id
    ),
    'description', p_report.description,
    'status', p_report.status,
    'reported_by', (
      select jsonb_build_object(
        'id', w.id, 'display_name', w.display_name, 'display_name_bn', w.display_name_bn
      )
      from public.profiles w
      where w.id = p_report.reported_by
    ),
    'technician', (
      select jsonb_build_object(
        'id', t.id, 'display_name', t.display_name, 'display_name_bn', t.display_name_bn
      )
      from public.profiles t
      where t.id = p_report.technician_id
    ),
    'accepted_at', p_report.accepted_at,
    'created_at', p_report.created_at,
    'updated_at', p_report.updated_at
  );
$$;

create or replace function public.list_machines()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.require_role(array['worker', 'manager']::public.user_role[]);

  return (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', m.id, 'name', m.name, 'name_bn', m.name_bn,
          'code', m.code, 'seat', m.seat, 'floor', m.floor
        )
        order by m.name
      ),
      '[]'::jsonb
    )
    from public.machines m
  );
end;
$$;
