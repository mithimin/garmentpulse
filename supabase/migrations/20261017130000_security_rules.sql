-- =============================================================================
-- Migration 2: security rules and live updates
-- =============================================================================
-- What this file does, in plain words:
--   1. Adds a small helper that answers: "what is the role of the person
--      who is asking?" (the server asks the database, never the app).
--   2. Adds ONE rule on the reports table: who may SEE which report.
--   3. Switches on live updates (Realtime) for reports, so a new report
--      reaches the manager within 5 seconds (docs/api-contract.md section 7).
--
-- What this file does NOT do (on purpose):
--   It gives nobody permission to create, change or delete anything.
--   Apps never write tables directly (docs/api-contract.md section 2.1).
--   All changes will go through functions in the next migrations. Those
--   functions run with extra rights and check the role themselves.
--
-- Who may SEE which report:
--   worker      -> only the reports they made
--   technician  -> only the reports assigned to them
--   manager     -> all reports
--   owner       -> all reports (read-only: no write rule exists for anyone)
--
-- Rules for this folder (see supabase/CLAUDE.md):
--   * Never edit an old migration. Add a NEW file for every change.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Helper: the role of the person asking
-- -----------------------------------------------------------------------------
-- auth.uid() is the id of the logged-in person (null when not logged in).
-- The helper reads profiles with extra rights, because profiles is locked
-- for normal users. It returns null if the person is not logged in or has
-- no profile yet.
--
-- "security definer" = runs with the rights of its owner (not the caller).
-- "set search_path = ''" = a safety habit, so nobody can trick it into
-- using a look-alike table; that is why every name below says "public.".
create function public.get_my_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

-- Only logged-in people may ask. People who are not logged in cannot.
revoke all on function public.get_my_role() from public, anon;
grant execute on function public.get_my_role() to authenticated;


-- -----------------------------------------------------------------------------
-- reports: who may SEE which report
-- -----------------------------------------------------------------------------
-- The lock from migration 1 is still on. This gives back READ access only,
-- and only for the rows the rule below allows.
grant select on public.reports to authenticated;

create policy reports_select_by_role
  on public.reports
  for select
  to authenticated
  using (
    reported_by   = (select auth.uid())                     -- worker: own reports
    or technician_id = (select auth.uid())                  -- technician: own jobs
    or (select public.get_my_role()) in ('manager', 'owner') -- manager and owner: all
  );


-- -----------------------------------------------------------------------------
-- Live updates
-- -----------------------------------------------------------------------------
-- Apps listen to changes on reports. Realtime applies the rule above, so
-- each person only receives the reports they are allowed to see.
alter publication supabase_realtime add table public.reports;
