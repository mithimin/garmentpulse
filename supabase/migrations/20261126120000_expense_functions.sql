-- =============================================================================
-- Migration 18: the expense functions
-- =============================================================================
-- What this file does, in plain words:
--   Adds the eight functions of docs/api-contract.md section 4.8 (same names,
--   inputs, results and error codes):
--
--     submit_expense(report_id, amount, reason, invoice_path, receipt_path)  technician
--     list_my_expenses()                                                     technician
--     list_expenses(status?)                                          manager, owner
--     get_expense(expense_id)                   own technician, manager, owner
--     decide_expense(expense_id, decision, reason?)                           owner
--     record_expense(expense_id)                                            manager
--     get_expense_limit()                                                     owner
--     set_expense_limit(amount)                                               owner
--
-- The flow:
--   A technician sends a cost with two photos. If it is at or under the
--   owner's limit it is 'approved' at once. If it is over the limit, or no
--   limit is set, it is 'waiting' until the owner decides. The manager can
--   record only an approved expense.
--
-- How every function works (like migration 4): check login and role, check the
-- inputs, check the rules, then make the change in ONE step.
--
-- Rules for this folder (see supabase/CLAUDE.md):
--   * Never edit an old migration. Add a NEW file for every change.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Private helpers: building the answers
-- -----------------------------------------------------------------------------
-- One person as { id, display_name, display_name_bn }, or JSON null.
create function public.person_json(p_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', p.id, 'display_name', p.display_name, 'display_name_bn', p.display_name_bn
  )
  from public.profiles p
  where p.id = p_id;
$$;

-- One Expense in the exact shape of docs/api-contract.md section 3.
create function public.expense_json(p_expense public.expenses)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', p_expense.id,
    'report', (
      select jsonb_build_object(
        'id', r.id,
        'description', r.description,
        'machine', jsonb_build_object(
          'id', m.id, 'name', m.name, 'name_bn', m.name_bn,
          'code', m.code, 'seat', m.seat, 'floor', m.floor
        )
      )
      from public.reports r
      join public.machines m on m.id = r.machine_id
      where r.id = p_expense.report_id
    ),
    'amount', p_expense.amount,
    'reason', p_expense.reason,
    'status', p_expense.status,
    'technician', public.person_json(p_expense.technician_id),
    'invoice_path', p_expense.invoice_path,
    'receipt_path', p_expense.receipt_path,
    'limit_at_submit', p_expense.limit_at_submit,
    'decided_by', public.person_json(p_expense.decided_by),
    'decided_at', p_expense.decided_at,
    'rejection_reason', p_expense.rejection_reason,
    'recorded_by', public.person_json(p_expense.recorded_by),
    'recorded_at', p_expense.recorded_at,
    'created_at', p_expense.created_at,
    'updated_at', p_expense.updated_at
  );
$$;

-- Is this a usable amount of money? More than `p_lowest` is checked by the
-- caller; here: not empty, not negative, not too big, at most 2 decimals.
create function public.is_money(p_amount numeric)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    p_amount >= 0 and p_amount <= 10000000 and p_amount = round(p_amount, 2),
    false
  );
$$;


-- -----------------------------------------------------------------------------
-- submit_expense(...) -- technician
-- -----------------------------------------------------------------------------
create function public.submit_expense(
  report_id    text,
  amount       numeric,
  reason       text,
  invoice_path text,
  receipt_path text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me      uuid;
  v_report  public.reports;
  v_reason  text;
  v_invoice text;
  v_receipt text;
  v_pattern text;
  v_limit   numeric(12, 2);
  v_expense public.expenses;
begin
  perform public.require_role(array['technician']::public.user_role[]);
  v_me := (select auth.uid());

  -- The job: it exists, it is mine, I accepted it, and I started it.
  select * into v_report
  from public.reports r
  where r.id = public.try_uuid(submit_expense.report_id)
  for update;
  if not found then
    raise exception 'NOT_FOUND';
  end if;
  if v_report.technician_id is distinct from v_me then
    raise exception 'NOT_ALLOWED';
  end if;
  if v_report.accepted_at is null then
    raise exception 'JOB_NOT_ACCEPTED';
  end if;
  if v_report.status = 'waiting' then
    raise exception 'INVALID_STATUS_CHANGE';
  end if;

  -- The amount and the reason.
  if not public.is_money(submit_expense.amount) or submit_expense.amount = 0 then
    raise exception 'INVALID_INPUT';
  end if;
  v_reason := trim(coalesce(submit_expense.reason, ''));
  if length(v_reason) not between 1 and 500 then
    raise exception 'INVALID_INPUT';
  end if;

  -- The photos: both named, different, and in MY folder.
  v_invoice := coalesce(submit_expense.invoice_path, '');
  v_receipt := coalesce(submit_expense.receipt_path, '');
  if trim(v_invoice) = '' or trim(v_receipt) = '' then
    raise exception 'RECEIPT_REQUIRED';
  end if;
  v_pattern := '^' || v_me::text || '/[A-Za-z0-9_-]{1,100}\.(jpg|jpeg|png)$';
  if v_invoice !~ v_pattern or v_receipt !~ v_pattern or v_invoice = v_receipt then
    raise exception 'INVALID_INPUT';
  end if;

  -- One technician sends one expense at a time, so the "used already" check
  -- below cannot be passed by two calls at the same moment.
  perform pg_advisory_xact_lock(hashtext('expense:' || v_me::text));

  -- A photo belongs to only one expense (as invoice OR as receipt).
  if exists (
    select 1 from public.expenses e
    where e.invoice_path in (v_invoice, v_receipt)
       or e.receipt_path in (v_invoice, v_receipt)
  ) then
    raise exception 'INVALID_INPUT';
  end if;

  -- Both photos must really have been uploaded. No receipt, no expense.
  if (
    select count(*) from storage.objects o
    where o.bucket_id = 'expense-photos' and o.name in (v_invoice, v_receipt)
  ) <> 2 then
    raise exception 'RECEIPT_REQUIRED';
  end if;

  -- Under or at the limit: approved. Over it, or no limit: wait for the owner.
  select s.limit_amount into v_limit from public.expense_settings s;

  insert into public.expenses (
    report_id, technician_id, amount, reason, status,
    invoice_path, receipt_path, limit_at_submit
  )
  values (
    v_report.id, v_me, submit_expense.amount, v_reason,
    case
      when v_limit is not null and submit_expense.amount <= v_limit
        then 'approved'::public.expense_status
      else 'waiting'::public.expense_status
    end,
    v_invoice, v_receipt, v_limit
  )
  returning * into v_expense;

  return public.expense_json(v_expense);
end;
$$;


-- -----------------------------------------------------------------------------
-- list_my_expenses() -- technician
-- -----------------------------------------------------------------------------
create function public.list_my_expenses()
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
      jsonb_agg(public.expense_json(e) order by e.created_at desc, e.id),
      '[]'::jsonb
    )
    from public.expenses e
    where e.technician_id = (select auth.uid())
  );
end;
$$;


-- -----------------------------------------------------------------------------
-- list_expenses(status?) -- manager, owner
-- -----------------------------------------------------------------------------
create function public.list_expenses(status text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.require_role(array['manager', 'owner']::public.user_role[]);

  if list_expenses.status is not null
     and list_expenses.status not in ('waiting', 'approved', 'rejected') then
    raise exception 'INVALID_INPUT';
  end if;

  return (
    select coalesce(
      jsonb_agg(public.expense_json(e) order by e.created_at desc, e.id),
      '[]'::jsonb
    )
    from public.expenses e
    where list_expenses.status is null
       or e.status::text = list_expenses.status
  );
end;
$$;


-- -----------------------------------------------------------------------------
-- get_expense(expense_id) -- own technician, manager, owner
-- -----------------------------------------------------------------------------
-- Anyone else gets NOT_FOUND, so nobody can probe for expense ids.
create function public.get_expense(expense_id text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me      uuid;
  v_role    public.user_role;
  v_expense public.expenses;
begin
  v_me := (select auth.uid());
  if v_me is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;
  v_role := public.get_my_role();

  select * into v_expense
  from public.expenses e
  where e.id = public.try_uuid(get_expense.expense_id);

  -- coalesce: an empty value must mean "no", never "let them in".
  if not found
     or not coalesce(
       v_role in ('manager', 'owner')
       or (v_role = 'technician' and v_expense.technician_id = v_me),
       false
     ) then
    raise exception 'NOT_FOUND';
  end if;

  return public.expense_json(v_expense);
end;
$$;


-- -----------------------------------------------------------------------------
-- decide_expense(expense_id, decision, reason?) -- owner
-- -----------------------------------------------------------------------------
create function public.decide_expense(
  expense_id text,
  decision   text,
  reason     text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reason  text;
  v_expense public.expenses;
begin
  perform public.require_role(array['owner']::public.user_role[]);

  if decide_expense.decision is null
     or decide_expense.decision not in ('approved', 'rejected') then
    raise exception 'INVALID_INPUT';
  end if;

  -- A rejection needs a short reason. For an approval it is ignored.
  if decide_expense.decision = 'rejected' then
    v_reason := trim(coalesce(decide_expense.reason, ''));
    if length(v_reason) not between 1 and 300 then
      raise exception 'INVALID_INPUT';
    end if;
  end if;

  select * into v_expense
  from public.expenses e
  where e.id = public.try_uuid(decide_expense.expense_id)
  for update;
  if not found then
    raise exception 'NOT_FOUND';
  end if;

  if v_expense.status <> 'waiting' then
    raise exception 'EXPENSE_ALREADY_DECIDED';
  end if;

  update public.expenses e
  set status           = decide_expense.decision::public.expense_status,
      decided_by       = (select auth.uid()),
      decided_at       = now(),
      rejection_reason = v_reason
  where e.id = v_expense.id
  returning * into v_expense;

  return public.expense_json(v_expense);
end;
$$;


-- -----------------------------------------------------------------------------
-- record_expense(expense_id) -- manager
-- -----------------------------------------------------------------------------
create function public.record_expense(expense_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_expense public.expenses;
begin
  perform public.require_role(array['manager']::public.user_role[]);

  select * into v_expense
  from public.expenses e
  where e.id = public.try_uuid(record_expense.expense_id)
  for update;
  if not found then
    raise exception 'NOT_FOUND';
  end if;

  -- Blocked until approved: waiting and rejected expenses cannot be recorded.
  if v_expense.status <> 'approved' then
    raise exception 'EXPENSE_NOT_APPROVED';
  end if;

  if v_expense.recorded_at is not null then
    raise exception 'EXPENSE_ALREADY_RECORDED';
  end if;

  update public.expenses e
  set recorded_by = (select auth.uid()),
      recorded_at = now()
  where e.id = v_expense.id
  returning * into v_expense;

  return public.expense_json(v_expense);
end;
$$;


-- -----------------------------------------------------------------------------
-- get_expense_limit() and set_expense_limit(amount) -- owner
-- -----------------------------------------------------------------------------
create function public.get_expense_limit()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.require_role(array['owner']::public.user_role[]);

  -- With no row yet, both answers are JSON null.
  return jsonb_build_object(
    'amount',     (select s.limit_amount from public.expense_settings s),
    'updated_at', (select s.updated_at   from public.expense_settings s)
  );
end;
$$;

create function public.set_expense_limit(amount numeric)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.expense_settings;
begin
  perform public.require_role(array['owner']::public.user_role[]);

  if not public.is_money(set_expense_limit.amount) then
    raise exception 'INVALID_INPUT';
  end if;

  insert into public.expense_settings (only_row, limit_amount, updated_at)
  values (true, set_expense_limit.amount, now())
  on conflict (only_row) do update
    set limit_amount = excluded.limit_amount,
        updated_at   = excluded.updated_at
  returning * into v_row;

  return jsonb_build_object('amount', v_row.limit_amount, 'updated_at', v_row.updated_at);
end;
$$;


-- =============================================================================
-- Who may call them: only logged-in people (each function checks the role)
-- =============================================================================
-- Helpers are private.
revoke all on function public.person_json(uuid)              from public, anon, authenticated;
revoke all on function public.expense_json(public.expenses)  from public, anon, authenticated;
revoke all on function public.is_money(numeric)              from public, anon, authenticated;

revoke all on function public.submit_expense(text, numeric, text, text, text) from public, anon;
revoke all on function public.list_my_expenses()                              from public, anon;
revoke all on function public.list_expenses(text)                             from public, anon;
revoke all on function public.get_expense(text)                               from public, anon;
revoke all on function public.decide_expense(text, text, text)                from public, anon;
revoke all on function public.record_expense(text)                            from public, anon;
revoke all on function public.get_expense_limit()                             from public, anon;
revoke all on function public.set_expense_limit(numeric)                      from public, anon;

grant execute on function public.submit_expense(text, numeric, text, text, text) to authenticated;
grant execute on function public.list_my_expenses()                              to authenticated;
grant execute on function public.list_expenses(text)                             to authenticated;
grant execute on function public.get_expense(text)                               to authenticated;
grant execute on function public.decide_expense(text, text, text)                to authenticated;
grant execute on function public.record_expense(text)                            to authenticated;
grant execute on function public.get_expense_limit()                             to authenticated;
grant execute on function public.set_expense_limit(numeric)                      to authenticated;
