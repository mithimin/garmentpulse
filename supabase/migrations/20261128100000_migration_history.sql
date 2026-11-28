-- 20261128100000_migration_history.sql
--
-- A small notebook inside the database that says which migration files have been run.
-- Why: until now nobody could tell from the database which files had been run,
-- so the team could fall out of sync.
--
-- The 18 earlier files are recorded here as "baseline". On 2026-11-28 their tables
-- and function names were checked against the live database and matched. The
-- check did not compare the full text of each function.
--
-- Security: the table has row level security on and NO policies, so apps and
-- anonymous users cannot read or write it. Only the database owner can.

create table if not exists public.applied_migrations (
  name text primary key,
  applied_at timestamptz not null default now(),
  note text
);

alter table public.applied_migrations enable row level security;

insert into public.applied_migrations (name, note) values
  ('20261017120000_create_tables.sql', 'baseline 2026-11-28'),
  ('20261017130000_security_rules.sql', 'baseline 2026-11-28'),
  ('20261017140000_read_functions.sql', 'baseline 2026-11-28'),
  ('20261017150000_action_functions.sql', 'baseline 2026-11-28'),
  ('20261018100000_fix_get_report_queue.sql', 'baseline 2026-11-28'),
  ('20261019100000_create_invite_codes.sql', 'baseline 2026-11-28'),
  ('20261019110000_invite_code_functions.sql', 'baseline 2026-11-28'),
  ('20261019120000_signup_guard.sql', 'baseline 2026-11-28'),
  ('20261020100000_bangla_names.sql', 'baseline 2026-11-28'),
  ('20261020110000_bangla_name_at_signup.sql', 'baseline 2026-11-28'),
  ('20261102100000_machine_codes.sql', 'baseline 2026-11-28'),
  ('20261107100000_machine_seats.sql', 'baseline 2026-11-28'),
  ('20261114100000_machine_floors_and_states.sql', 'baseline 2026-11-28'),
  ('20261115100000_seat_unique_per_floor.sql', 'baseline 2026-11-28'),
  ('20261122100000_worker_assigned_machine.sql', 'baseline 2026-11-28'),
  ('20261126100000_expense_tables.sql', 'baseline 2026-11-28'),
  ('20261126110000_expense_photos.sql', 'baseline 2026-11-28'),
  ('20261126120000_expense_functions.sql', 'baseline 2026-11-28'),
  ('20261128100000_migration_history.sql', 'this file')
on conflict (name) do nothing;
