-- =============================================================================
-- Migration 7: the table for invite codes (step A1 of sign-up with invite codes)
-- =============================================================================
-- What this file does, in plain words:
--   Builds ONE table, `invite_codes`, that holds the codes people use to sign
--   up. Then it LOCKS the table, so nobody can read or change it directly.
--   The functions that make, list and check codes come in the next migration,
--   and the sign-up guard after that.
--
-- The plan is in docs/api-contract.md section 4.7 and docs/mvp.md section 2.1:
--   * The OWNER makes `manager` codes. A MANAGER makes `worker` and
--     `technician` codes. Nobody makes `owner` codes: owner accounts are
--     never created by sign-up (Sakib makes them by hand).
--   * A code works ONCE and EXPIRES after 7 days.
--   * The code decides the role of the new person. Nobody chooses their own.
--
-- Rules for this folder (see supabase/CLAUDE.md):
--   * Never edit an old migration. Add a NEW file for every change.
--   * Row Level Security (a lock on each row) is on for every table.
-- =============================================================================


create table public.invite_codes (
  id          uuid primary key default gen_random_uuid(),

  -- The code people type. 10 capital letters and digits, WITHOUT look-alike
  -- characters: no 0 or O, no 1 or I. (Pattern: A-H, J-N, P-Z, and 2-9.)
  -- People may type small letters; the functions turn them into capitals.
  code        text not null unique
              check (code ~ '^[A-HJ-NP-Z2-9]{10}$'),

  -- The role this code gives. The owner can never be created by a code.
  role        public.user_role not null
              check (role in ('worker', 'technician', 'manager')),

  -- Who made the code (an owner or a manager).
  created_by  uuid not null references public.profiles (id),
  created_at  timestamptz not null default now(),

  -- A code stops working 7 days after it was made.
  expires_at  timestamptz not null default (now() + interval '7 days'),

  -- Filled in when somebody signs up with the code. Empty = not used yet.
  -- If the person is ever deleted, the code stays and just forgets who used it.
  used_by     uuid references public.profiles (id) on delete set null,
  used_at     timestamptz
);

-- "Show me the codes I made, newest first" must be fast.
create index invite_codes_created_by_idx
  on public.invite_codes (created_by, created_at desc);


-- -----------------------------------------------------------------------------
-- Lock the table (the database is the security guard)
-- -----------------------------------------------------------------------------
-- With no rules, nobody sees any row. We also take away every direct
-- permission, so apps and strangers cannot touch the table at all. Only the
-- functions in the next migration (which run with extra rights and check the
-- role themselves) and the sign-up guard can read or change it.
alter table public.invite_codes enable row level security;

revoke all on public.invite_codes from anon, authenticated;
