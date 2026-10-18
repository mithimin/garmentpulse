-- =============================================================================
-- Migration 6: fix get_report for reports that are still in the queue
-- =============================================================================
-- The bug, in plain words:
--   get_report(report_id) must only show a report to
--     * the worker who made it,
--     * the technician it is assigned to,
--     * the manager and the owner.
--   Everyone else must get NOT_FOUND (docs/api-contract.md section 4.3).
--
--   A report that is still in the queue has NO technician yet (the column is
--   empty, "NULL"). In SQL, comparing an empty value with a person's id gives
--   "unknown", not "no". The old check treated "unknown" as "allowed", so any
--   worker or technician could read ANY queued report by its id.
--
-- The fix: an empty technician now counts as "not this person" (coalesce ...,
-- false), so the answer is always a clear yes or no.
--
-- Found by supabase/tests/real_client.check.ts and covered from now on by
-- supabase/tests/api_rules_check.sql.
--
-- "create or replace" keeps the same name, inputs and permissions, so the apps
-- see no change except that the leak is closed.
--
-- Rules for this folder (see supabase/CLAUDE.md):
--   * Never edit an old migration. Add a NEW file for every change.
-- =============================================================================

create or replace function public.get_report(report_id text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_role    public.user_role;
  v_report  public.reports;
  v_can_see boolean;
begin
  v_role := public.require_role(
    array['worker', 'technician', 'manager', 'owner']::public.user_role[]
  );

  select * into v_report
  from public.reports r
  where r.id = public.try_uuid(get_report.report_id);

  if not found then
    raise exception 'NOT_FOUND';
  end if;

  -- Always a clear true or false. An empty technician (still in the queue)
  -- counts as "not this person".
  v_can_see := v_role in ('manager', 'owner')
               or v_report.reported_by = (select auth.uid())
               or coalesce(v_report.technician_id = (select auth.uid()), false);

  if not v_can_see then
    raise exception 'NOT_FOUND';
  end if;

  return public.report_json(v_report);
end;
$$;
