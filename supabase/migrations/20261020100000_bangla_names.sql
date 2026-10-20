-- =============================================================================
-- Migration 10: optional Bangla names for people and machines
-- =============================================================================
-- What this file does, in plain words:
--   1. Adds ONE new optional column to the people table (`display_name_bn`),
--      ONE to the machines table (`name_bn`), and ONE to the list of
--      pre-approved accounts (`display_name_bn`). They start EMPTY.
--   2. Changes the functions that send names to the apps, so that the Bangla
--      name travels next to the English one:
--        * report_json   -> inside every report: machine.name_bn,
--                           reported_by.display_name_bn, technician.display_name_bn
--        * get_my_profile -> display_name_bn
--        * list_machines  -> name_bn
--        * list_technicians -> display_name_bn
--      Every other function that returns a report (list_my_reports,
--      list_reports, get_report, create_report, assign_technician, accept_job,
--      update_job_status, list_my_jobs) already uses report_json, so they get
--      the new fields for free.
--
-- How the apps use it (docs/api-contract.md):
--   * The Bangla name is OPTIONAL. When nobody has written one, the field is
--     `null`, and the app shows the English name.
--   * Nothing is generated or translated automatically. A person types each
--     Bangla name (a Bangla speaker for the test data, the person themselves
--     at sign-up, see the next migration).
--
-- Nothing else changes: the same function names, inputs, permissions and
-- error codes. Only extra fields appear in the results, so the apps keep
-- working before and after this file. "create or replace" keeps the existing
-- permissions of each function.
--
-- Rules for this folder (see supabase/CLAUDE.md):
--   * Never edit an old migration. Add a NEW file for every change.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. The new, optional columns
-- -----------------------------------------------------------------------------
-- A Bangla name is either empty or 1 to 80 letters long (the same limit as the
-- English name). The tables stay locked: these columns inherit the lock.
alter table public.profiles
  add column display_name_bn text
  check (display_name_bn is null or length(trim(display_name_bn)) between 1 and 80);

alter table public.machines
  add column name_bn text
  check (name_bn is null or length(trim(name_bn)) between 1 and 80);

alter table public.approved_accounts
  add column display_name_bn text
  check (display_name_bn is null or length(trim(display_name_bn)) between 1 and 80);


-- -----------------------------------------------------------------------------
-- 2. One report, in the shape of docs/api-contract.md section 3
-- -----------------------------------------------------------------------------
-- Same as before, plus the Bangla names inside machine, reported_by and
-- technician. `technician` is still JSON null when nobody is assigned yet.
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
      select jsonb_build_object('id', m.id, 'name', m.name, 'name_bn', m.name_bn)
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


-- -----------------------------------------------------------------------------
-- 3. The profile of the person who is asking
-- -----------------------------------------------------------------------------
create or replace function public.get_my_profile()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles;
begin
  if (select auth.uid()) is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select * into v_profile from public.profiles where id = (select auth.uid());
  if not found then
    raise exception 'NOT_ALLOWED';
  end if;

  return jsonb_build_object(
    'id', v_profile.id,
    'display_name', v_profile.display_name,
    'display_name_bn', v_profile.display_name_bn,
    'email', v_profile.email,
    'role', v_profile.role
  );
end;
$$;


-- -----------------------------------------------------------------------------
-- 4. The machine list (worker's dropdown, manager)
-- -----------------------------------------------------------------------------
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
        jsonb_build_object('id', m.id, 'name', m.name, 'name_bn', m.name_bn)
        order by m.name
      ),
      '[]'::jsonb
    )
    from public.machines m
  );
end;
$$;


-- -----------------------------------------------------------------------------
-- 5. The technicians list with free or busy (manager)
-- -----------------------------------------------------------------------------
create or replace function public.list_technicians()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.require_role(array['manager']::public.user_role[]);

  return (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'display_name', p.display_name,
          'display_name_bn', p.display_name_bn,
          'availability', case
            when exists (
              select 1 from public.reports r
              where r.technician_id = p.id and r.status <> 'resolved'
            ) then 'busy'
            else 'free'
          end
        )
        order by p.display_name
      ),
      '[]'::jsonb
    )
    from public.profiles p
    where p.role = 'technician'
  );
end;
$$;
