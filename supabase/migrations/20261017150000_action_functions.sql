-- =============================================================================
-- Migration 4: the action functions
-- =============================================================================
-- What this file does, in plain words:
--   Adds the only four ways to CHANGE a report. They match
--   docs/api-contract.md exactly (same names, inputs, results, error codes):
--
--     create_report(machine_id, description)     worker
--     assign_technician(report_id, technician_id) manager
--     accept_job(report_id)                      technician
--     update_job_status(report_id, status)       technician
--
-- How every function works:
--   1. Check login and role (NOT_AUTHENTICATED / NOT_ALLOWED).
--   2. Check the inputs (INVALID_INPUT / NOT_FOUND).
--   3. Check the rules (TECHNICIAN_BUSY, REPORT_ALREADY_ASSIGNED, ...).
--   4. Make the change in ONE step and return the updated report.
--
-- Safety nets:
--   * The row being changed is locked while the function runs, so two people
--     cannot change the same report at the same moment.
--   * The "one open job per technician" index from migration 1 is the last
--     guard: if two managers pick the same technician at once, only one
--     succeeds and the other gets TECHNICIAN_BUSY.
--
-- Rules for this folder (see supabase/CLAUDE.md):
--   * Never edit an old migration. Add a NEW file for every change.
--   * The owner has no function here: the owner can only look.
-- =============================================================================


-- create_report(machine_id, description) -- worker
-- A new report starts as 'waiting' with nobody assigned: it is in the queue.
create function public.create_report(machine_id text, description text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_machine_id  uuid;
  v_description text;
  v_report      public.reports;
begin
  perform public.require_role(array['worker']::public.user_role[]);

  v_description := trim(coalesce(create_report.description, ''));
  if length(v_description) not between 1 and 500 then
    raise exception 'INVALID_INPUT';
  end if;

  v_machine_id := public.try_uuid(create_report.machine_id);
  if v_machine_id is null
     or not exists (select 1 from public.machines m where m.id = v_machine_id) then
    raise exception 'NOT_FOUND';
  end if;

  insert into public.reports (machine_id, reported_by, description)
  values (v_machine_id, (select auth.uid()), v_description)
  returning * into v_report;

  return public.report_json(v_report);
end;
$$;


-- assign_technician(report_id, technician_id) -- manager
-- Rules: the technician must be free, the report must not be resolved and
-- must not already have a technician. The status stays 'waiting' until the
-- technician starts work. There is no auto-assign: the manager always decides.
create function public.assign_technician(report_id text, technician_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_report_id     uuid;
  v_technician_id uuid;
  v_report        public.reports;
begin
  perform public.require_role(array['manager']::public.user_role[]);

  v_report_id     := public.try_uuid(assign_technician.report_id);
  v_technician_id := public.try_uuid(assign_technician.technician_id);

  -- Lock the report row while we work on it.
  select * into v_report
  from public.reports r
  where r.id = v_report_id
  for update;
  if not found then
    raise exception 'NOT_FOUND';
  end if;

  -- The chosen person must really be a technician.
  if v_technician_id is null
     or not exists (
       select 1 from public.profiles p
       where p.id = v_technician_id and p.role = 'technician'
     ) then
    raise exception 'NOT_FOUND';
  end if;

  if v_report.status = 'resolved' then
    raise exception 'INVALID_STATUS_CHANGE';
  end if;

  if v_report.technician_id is not null then
    raise exception 'REPORT_ALREADY_ASSIGNED';
  end if;

  if exists (
    select 1 from public.reports r
    where r.technician_id = v_technician_id and r.status <> 'resolved'
  ) then
    raise exception 'TECHNICIAN_BUSY';
  end if;

  begin
    update public.reports r
    set technician_id = v_technician_id
    where r.id = v_report.id
    returning * into v_report;
  exception when unique_violation then
    -- Someone else assigned this technician a moment earlier.
    raise exception 'TECHNICIAN_BUSY';
  end;

  return public.report_json(v_report);
end;
$$;


-- accept_job(report_id) -- technician
-- Only sets accepted_at. The status stays 'waiting' until the technician
-- moves it to 'in_progress' (contract section 8, decision 1).
create function public.accept_job(report_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_report public.reports;
begin
  perform public.require_role(array['technician']::public.user_role[]);

  select * into v_report
  from public.reports r
  where r.id = public.try_uuid(accept_job.report_id)
  for update;
  if not found then
    raise exception 'NOT_FOUND';
  end if;

  -- Not assigned to this technician (assigned to someone else, or to nobody).
  if v_report.technician_id is distinct from (select auth.uid()) then
    raise exception 'NOT_ALLOWED';
  end if;

  if v_report.accepted_at is not null then
    raise exception 'JOB_ALREADY_ACCEPTED';
  end if;

  update public.reports r
  set accepted_at = now()
  where r.id = v_report.id
  returning * into v_report;

  return public.report_json(v_report);
end;
$$;


-- update_job_status(report_id, status) -- technician
-- `status` is 'in_progress' or 'resolved'. The job must be accepted first.
-- Moves go forward only: waiting -> in_progress -> resolved. Resolved is
-- final. (Skipping straight to 'resolved' is allowed: contract section 4.5
-- says a technician may "jump straight" to resolved.)
create function public.update_job_status(report_id text, status text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_new    public.report_status;
  v_report public.reports;
begin
  perform public.require_role(array['technician']::public.user_role[]);

  if update_job_status.status is null
     or update_job_status.status not in ('in_progress', 'resolved') then
    raise exception 'INVALID_INPUT';
  end if;
  v_new := update_job_status.status::public.report_status;

  select * into v_report
  from public.reports r
  where r.id = public.try_uuid(update_job_status.report_id)
  for update;
  if not found then
    raise exception 'NOT_FOUND';
  end if;

  if v_report.technician_id is distinct from (select auth.uid()) then
    raise exception 'NOT_ALLOWED';
  end if;

  if v_report.accepted_at is null then
    raise exception 'JOB_NOT_ACCEPTED';
  end if;

  -- Forward only. The enum order is: waiting < in_progress < resolved.
  if v_new <= v_report.status then
    raise exception 'INVALID_STATUS_CHANGE';
  end if;

  update public.reports r
  set status = v_new
  where r.id = v_report.id
  returning * into v_report;

  return public.report_json(v_report);
end;
$$;


-- =============================================================================
-- Who may call them: only logged-in people (each function checks the role)
-- =============================================================================
revoke all on function public.create_report(text, text)      from public, anon;
revoke all on function public.assign_technician(text, text)  from public, anon;
revoke all on function public.accept_job(text)               from public, anon;
revoke all on function public.update_job_status(text, text)  from public, anon;

grant execute on function public.create_report(text, text)      to authenticated;
grant execute on function public.assign_technician(text, text)  to authenticated;
grant execute on function public.accept_job(text)               to authenticated;
grant execute on function public.update_job_status(text, text)  to authenticated;
