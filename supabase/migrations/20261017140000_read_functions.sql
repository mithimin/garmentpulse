-- =============================================================================
-- Migration 3: the read functions
-- =============================================================================
-- What this file does, in plain words:
--   Adds the functions the apps call to LOOK at information. They match
--   docs/api-contract.md exactly (same names, same inputs, same results,
--   same error codes):
--
--     get_my_profile()            everyone
--     list_machines()             worker, manager
--     list_my_reports()           worker
--     list_reports(status)        manager, owner
--     get_report(report_id)       worker (own), technician (assigned), manager, owner
--     list_technicians()          manager
--     list_my_jobs(include_past)  technician
--     get_owner_summary()         owner
--
-- How every function works:
--   1. Check the person is logged in (else error NOT_AUTHENTICATED).
--   2. Check the person's role is allowed (else error NOT_ALLOWED).
--   3. Return the result as JSON in the shape of docs/api-contract.md section 3.
--
-- Errors: the error message IS the capital-letter code (contract section 2.2).
--
-- Why "security definer": the tables are locked for normal users. These
-- functions run with extra rights, but they check the role themselves
-- before they read anything. The database stays the security guard.
--
-- Rules for this folder (see supabase/CLAUDE.md):
--   * Never edit an old migration. Add a NEW file for every change.
-- =============================================================================


-- =============================================================================
-- Private helpers (only other functions use them; apps cannot call them)
-- =============================================================================

-- Turn text into an id, or return null if the text is not a valid id.
-- This lets us answer NOT_FOUND instead of a confusing database error.
create function public.try_uuid(p_text text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  return p_text::uuid;
exception when others then
  return null;
end;
$$;

-- The shared role check.
--   not logged in            -> NOT_AUTHENTICATED
--   no profile / wrong role  -> NOT_ALLOWED
-- Returns the person's role when everything is fine.
create function public.require_role(p_allowed public.user_role[])
returns public.user_role
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_role public.user_role;
begin
  if (select auth.uid()) is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  v_role := public.get_my_role();

  if v_role is null or not (v_role = any (p_allowed)) then
    raise exception 'NOT_ALLOWED';
  end if;

  return v_role;
end;
$$;

-- Build one Report in the exact shape of docs/api-contract.md section 3.
-- technician is JSON null when nobody is assigned yet (= in the queue).
create function public.report_json(p_report public.reports)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', p_report.id,
    'machine', (
      select jsonb_build_object('id', m.id, 'name', m.name)
      from public.machines m
      where m.id = p_report.machine_id
    ),
    'description', p_report.description,
    'status', p_report.status,
    'reported_by', (
      select jsonb_build_object('id', w.id, 'display_name', w.display_name)
      from public.profiles w
      where w.id = p_report.reported_by
    ),
    'technician', (
      select jsonb_build_object('id', t.id, 'display_name', t.display_name)
      from public.profiles t
      where t.id = p_report.technician_id
    ),
    'accepted_at', p_report.accepted_at,
    'created_at', p_report.created_at,
    'updated_at', p_report.updated_at
  );
$$;

-- Helpers are private: nobody who is not the database owner may call them
-- directly. The public functions below call them with the owner's rights.
revoke all on function public.try_uuid(text)                 from public, anon, authenticated;
revoke all on function public.require_role(public.user_role[]) from public, anon, authenticated;
revoke all on function public.report_json(public.reports)    from public, anon, authenticated;


-- =============================================================================
-- Public functions (the apps call these)
-- =============================================================================

-- get_my_profile() -- Mobile, Web
-- Called right after login. The app uses the role to decide if the person
-- is on the right app (otherwise it shows WRONG_PLATFORM).
create function public.get_my_profile()
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
    'email', v_profile.email,
    'role', v_profile.role
  );
end;
$$;


-- list_machines() -- worker, manager. Feeds the worker's dropdown.
create function public.list_machines()
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
      jsonb_agg(jsonb_build_object('id', m.id, 'name', m.name) order by m.name),
      '[]'::jsonb
    )
    from public.machines m
  );
end;
$$;


-- list_my_reports() -- worker. Only the worker's own reports, newest first.
create function public.list_my_reports()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.require_role(array['worker']::public.user_role[]);

  return (
    select coalesce(
      jsonb_agg(public.report_json(r) order by r.created_at desc),
      '[]'::jsonb
    )
    from public.reports r
    where r.reported_by = (select auth.uid())
  );
end;
$$;


-- list_reports(status) -- manager, owner. All reports, newest first.
-- `status` is optional. It is text so that a wrong word gives INVALID_INPUT
-- instead of a database error.
create function public.list_reports(status text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_status public.report_status;
begin
  perform public.require_role(array['manager', 'owner']::public.user_role[]);

  if list_reports.status is not null then
    begin
      v_status := list_reports.status::public.report_status;
    exception when others then
      raise exception 'INVALID_INPUT';
    end;
  end if;

  return (
    select coalesce(
      jsonb_agg(public.report_json(r) order by r.created_at desc),
      '[]'::jsonb
    )
    from public.reports r
    where v_status is null or r.status = v_status
  );
end;
$$;


-- get_report(report_id) -- everyone who may see that report.
--   worker     -> only a report they made
--   technician -> only a report assigned to them
--   manager, owner -> any report
-- Anyone else gets NOT_FOUND (not NOT_ALLOWED), so nobody can probe for
-- report ids that exist (contract section 4.3).
create function public.get_report(report_id text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_role   public.user_role;
  v_report public.reports;
begin
  v_role := public.require_role(
    array['worker', 'technician', 'manager', 'owner']::public.user_role[]
  );

  select * into v_report
  from public.reports r
  where r.id = public.try_uuid(get_report.report_id);

  if not found
     or not (
       v_role in ('manager', 'owner')
       or v_report.reported_by   = (select auth.uid())
       or v_report.technician_id = (select auth.uid())
     )
  then
    raise exception 'NOT_FOUND';
  end if;

  return public.report_json(v_report);
end;
$$;


-- list_technicians() -- manager.
-- A technician is 'busy' when they have an unfinished report, else 'free'.
-- This is worked out every time and never stored, so it cannot go stale.
create function public.list_technicians()
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


-- list_my_jobs(include_past) -- technician.
-- Reports assigned to this technician, newest first. Resolved jobs
-- (the "past jobs") are included only when include_past is true.
create function public.list_my_jobs(include_past boolean default false)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.require_role(array['technician']::public.user_role[]);

  return (
    select coalesce(
      jsonb_agg(public.report_json(r) order by r.created_at desc),
      '[]'::jsonb
    )
    from public.reports r
    where r.technician_id = (select auth.uid())
      and (coalesce(list_my_jobs.include_past, false) or r.status <> 'resolved')
  );
end;
$$;


-- get_owner_summary() -- owner. The three count boxes.
create function public.get_owner_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.require_role(array['owner']::public.user_role[]);

  return (
    select jsonb_build_object(
      'waiting',     count(*) filter (where r.status = 'waiting'),
      'in_progress', count(*) filter (where r.status = 'in_progress'),
      'resolved',    count(*) filter (where r.status = 'resolved')
    )
    from public.reports r
  );
end;
$$;


-- =============================================================================
-- Who may call the public functions: only logged-in people
-- =============================================================================
revoke all on function public.get_my_profile()           from public, anon;
revoke all on function public.list_machines()            from public, anon;
revoke all on function public.list_my_reports()          from public, anon;
revoke all on function public.list_reports(text)         from public, anon;
revoke all on function public.get_report(text)           from public, anon;
revoke all on function public.list_technicians()         from public, anon;
revoke all on function public.list_my_jobs(boolean)      from public, anon;
revoke all on function public.get_owner_summary()        from public, anon;

grant execute on function public.get_my_profile()        to authenticated;
grant execute on function public.list_machines()         to authenticated;
grant execute on function public.list_my_reports()       to authenticated;
grant execute on function public.list_reports(text)      to authenticated;
grant execute on function public.get_report(text)        to authenticated;
grant execute on function public.list_technicians()      to authenticated;
grant execute on function public.list_my_jobs(boolean)   to authenticated;
grant execute on function public.get_owner_summary()     to authenticated;
