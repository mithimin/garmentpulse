-- =============================================================================
-- Migration 1: create the tables
-- =============================================================================
-- What this file does, in plain words:
--   Builds the three tables that hold GarmentPulse's information:
--     profiles  = one row per person (name, email, role)
--     machines  = the factory machines shown in the worker's dropdown
--     reports   = a broken-machine report, including who is fixing it
--   Then it LOCKS all three tables, so nobody can read or change anything
--   yet. The permission rules and the functions the apps call come in the
--   next migrations.
--
-- Why there is no separate "assignments" table:
--   docs/api-contract.md shows a Report with its own `technician` and
--   `accepted_at` fields, so one table is enough for the MVP.
--
-- Rules for this folder (see supabase/CLAUDE.md):
--   * Never edit an old migration. Add a NEW file for every change.
--   * Row Level Security (a lock on each row) is on for every table.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Allowed words
-- -----------------------------------------------------------------------------
-- A column of one of these types can only hold the listed words.
-- Names match docs/api-contract.md section 3 exactly.
create type public.user_role as enum ('worker', 'technician', 'manager', 'owner');

create type public.report_status as enum ('waiting', 'in_progress', 'resolved');


-- -----------------------------------------------------------------------------
-- profiles: one row per person
-- -----------------------------------------------------------------------------
-- `id` is the same id Supabase gives the person's login (auth.users), so
-- "who is asking?" is simply auth.uid(). In the MVP, Sakib creates the test
-- accounts by hand (decided with the team).
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text not null check (length(trim(display_name)) > 0),
  email         text not null unique,
  role          public.user_role not null,
  created_at    timestamptz not null default now()
);


-- -----------------------------------------------------------------------------
-- machines: the factory machines
-- -----------------------------------------------------------------------------
-- Typed in by hand as test data for the MVP (decided with the team).
create table public.machines (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique check (length(trim(name)) > 0),
  created_at  timestamptz not null default now()
);


-- -----------------------------------------------------------------------------
-- reports: a problem reported by a worker
-- -----------------------------------------------------------------------------
-- Life of a report (docs/api-contract.md section 2.6):
--   created    -> status 'waiting', technician empty  (this is "in the queue")
--   assigned   -> technician set, status still 'waiting'
--   accepted   -> accepted_at set, status still 'waiting'
--   started    -> status 'in_progress'
--   finished   -> status 'resolved' (final, nothing moves backwards)
create table public.reports (
  id            uuid primary key default gen_random_uuid(),
  machine_id    uuid not null references public.machines (id),
  reported_by   uuid not null references public.profiles (id),
  description   text not null
                check (length(trim(description)) between 1 and 500),
  status        public.report_status not null default 'waiting',
  technician_id uuid references public.profiles (id),  -- empty = nobody yet
  accepted_at   timestamptz,                            -- empty = not accepted
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- A job cannot be accepted, started or finished with nobody assigned.
  constraint reports_assigned_before_progress
    check (technician_id is not null
           or (accepted_at is null and status = 'waiting'))
);

-- A technician can have only ONE unfinished job at a time. This is what
-- makes a technician "busy" (error TECHNICIAN_BUSY). Because it is a
-- database rule, no app and no bug can break it.
create unique index reports_one_open_job_per_technician
  on public.reports (technician_id)
  where technician_id is not null and status <> 'resolved';

-- Fast lists: the manager's list, the worker's list, the technician's list.
create index reports_status_created_idx on public.reports (status, created_at desc);
create index reports_reported_by_idx    on public.reports (reported_by);
create index reports_technician_idx     on public.reports (technician_id);


-- -----------------------------------------------------------------------------
-- Keep `updated_at` correct automatically
-- -----------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger reports_set_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();


-- -----------------------------------------------------------------------------
-- Lock everything (the database is the security guard)
-- -----------------------------------------------------------------------------
-- 1. Turn on Row Level Security. With no rules yet, nobody sees any row.
alter table public.profiles enable row level security;
alter table public.machines enable row level security;
alter table public.reports  enable row level security;

-- 2. Take away every direct permission from people who are not logged in
--    and from logged-in apps. Apps never write tables directly; they call
--    functions (docs/api-contract.md section 2.1). The next migrations give
--    back only the small amount that is needed.
revoke all on public.profiles from anon, authenticated;
revoke all on public.machines from anon, authenticated;
revoke all on public.reports  from anon, authenticated;
