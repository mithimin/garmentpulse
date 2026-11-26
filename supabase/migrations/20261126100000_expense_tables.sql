-- =============================================================================
-- Migration 16: expenses and the owner's expense limit (tables only)
-- =============================================================================
-- What this file does, in plain words:
--   1. Adds a table `expenses`: one row for every repair cost a technician
--      sends (amount, reason, the two photos, and what happened to it).
--   2. Adds a table `expense_settings`: ONE row holding the owner's limit.
--      No row means "the owner has not set a limit yet".
--   3. Locks both tables. Nobody writes them directly. Reading `expenses` is
--      allowed only for: the technician who sent it, the manager, the owner.
--   4. Switches on live updates (Realtime) for `expenses`, so the manager sees
--      the owner's decision without a refresh.
--
-- Product rules: docs/prd.md FR-04 and FR-05. Names and shapes:
-- docs/api-contract.md section 4.8. The functions come in migration 18.
--
-- The database itself refuses impossible rows (see the "constraint" lines), so
-- no app and no mistake in a function can store, for example, a recorded
-- expense that was rejected.
--
-- Rules for this folder (see supabase/CLAUDE.md):
--   * Never edit an old migration. Add a NEW file for every change.
--   * Row Level Security is on for every table, and apps never write tables.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. The three statuses
-- -----------------------------------------------------------------------------
create type public.expense_status as enum ('waiting', 'approved', 'rejected');


-- -----------------------------------------------------------------------------
-- 2. The expenses
-- -----------------------------------------------------------------------------
create table public.expenses (
  id               uuid primary key default gen_random_uuid(),
  -- A report that has an expense cannot be deleted: money records must not
  -- disappear by accident. (reset_demo_data.sql deletes expenses first.)
  report_id        uuid not null references public.reports (id),
  technician_id    uuid not null references public.profiles (id),
  amount           numeric(12, 2) not null
                   check (amount > 0 and amount <= 10000000),
  reason           text not null
                   check (length(trim(reason)) between 1 and 500),
  status           public.expense_status not null,
  -- Where the two photos are kept in the `expense-photos` storage box.
  invoice_path     text not null unique,
  receipt_path     text not null unique,
  -- The owner's limit at the moment the expense was sent (null = none set).
  limit_at_submit  numeric(12, 2),
  -- Filled only when the OWNER decides.
  decided_by       uuid references public.profiles (id),
  decided_at       timestamptz,
  rejection_reason text
                   check (rejection_reason is null
                          or length(trim(rejection_reason)) between 1 and 300),
  -- Filled only when the MANAGER records it.
  recorded_by      uuid references public.profiles (id),
  recorded_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- The invoice photo and the receipt photo are two different files.
  constraint expenses_two_different_photos
    check (invoice_path <> receipt_path),
  -- "Who decided" and "when" come together.
  constraint expenses_decision_is_complete
    check ((decided_by is null) = (decided_at is null)),
  -- A waiting expense has no decision yet.
  constraint expenses_waiting_is_undecided
    check (status <> 'waiting' or decided_at is null),
  -- A rejection always comes from a decision and always has a reason.
  -- Nothing else has a rejection reason.
  constraint expenses_rejected_has_a_reason
    check ((status = 'rejected') = (rejection_reason is not null)),
  constraint expenses_rejected_was_decided
    check (status <> 'rejected' or decided_at is not null),
  -- Only an approved expense can be recorded.
  constraint expenses_record_is_complete
    check ((recorded_by is null) = (recorded_at is null)),
  constraint expenses_only_approved_is_recorded
    check (recorded_at is null or status = 'approved')
);

-- Fast lists: the manager's and owner's list, the technician's list.
create index expenses_status_created_idx on public.expenses (status, created_at desc);
create index expenses_technician_idx     on public.expenses (technician_id);
create index expenses_report_idx         on public.expenses (report_id);

-- Keep `updated_at` correct (the helper comes from migration 1).
create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();


-- -----------------------------------------------------------------------------
-- 3. The owner's limit: a table that can only ever hold ONE row
-- -----------------------------------------------------------------------------
create table public.expense_settings (
  only_row     boolean primary key default true check (only_row),
  limit_amount numeric(12, 2) not null
               check (limit_amount >= 0 and limit_amount <= 10000000),
  updated_at   timestamptz not null default now()
);


-- -----------------------------------------------------------------------------
-- 4. Lock everything, then give back only reading of expenses
-- -----------------------------------------------------------------------------
alter table public.expenses         enable row level security;
alter table public.expense_settings enable row level security;

revoke all on public.expenses         from anon, authenticated;
revoke all on public.expense_settings from anon, authenticated;

-- The limit is read only through get_expense_limit(), so it gets nothing more.
grant select on public.expenses to authenticated;

-- Workers match none of these lines, so they see no expense.
create policy expenses_select_by_role
  on public.expenses
  for select
  to authenticated
  using (
    technician_id = (select auth.uid())                      -- technician: own
    or (select public.get_my_role()) in ('manager', 'owner') -- manager, owner: all
  );


-- -----------------------------------------------------------------------------
-- 5. Live updates
-- -----------------------------------------------------------------------------
-- Realtime applies the rule above, so each person only receives what they may see.
alter publication supabase_realtime add table public.expenses;
