-- =============================================================================
-- Test data (seed) for GarmentPulse
-- =============================================================================
-- What this file does, in plain words:
--   Fills the database with a small, realistic "story" so everyone can try
--   the real functions: 5 people, 5 machines and 4 reports. The names follow
--   packages/shared/src/fixtures.ts (the fake data the apps used first).
--
-- THE STORY AFTER THIS FILE RUNS
--   Nila (worker) reported 4 problems:
--     * "The needle keeps breaking."   in progress, Tariq is on it (Tariq is BUSY)
--     * "Thread tension is too tight." waiting, in the queue
--     * "Strange noise from the motor." waiting, in the queue
--     * "The press does not heat up."  resolved by Hasan (a past job)
--   Hasan (technician) is FREE, so the manager can assign him a queued report.
--
-- BEFORE YOU RUN THIS FILE: create the 5 logins by hand
--   (this file never contains a password, on purpose).
--   Supabase dashboard > Authentication > Users > Add user > Create new user.
--   Tick "Auto Confirm User". Use THESE emails, and choose your own test
--   password for each (keep them private, never write them in a file):
--
--       nila@example.com     worker
--       tariq@example.com    technician
--       hasan@example.com    technician
--       farhan@example.com   manager
--       owner@example.com    owner
--
--   The file finds each person by email, so you never copy any ids.
--   If a login is missing, the file stops with a clear message.
--
-- Safe to run twice: it skips anything that already exists.
-- Local use: `supabase db reset` runs this automatically after the migrations
-- (create the 5 logins in the local Studio first).
-- Test data only. Never use real people or real passwords here.
-- =============================================================================

do $$
declare
  v_found int;
begin
  select count(*) into v_found
  from auth.users
  where email in (
    'nila@example.com', 'tariq@example.com', 'hasan@example.com',
    'farhan@example.com', 'owner@example.com'
  );

  if v_found <> 5 then
    raise exception
      'Seed stopped: found % of the 5 test logins. Create them first (see the top of this file).',
      v_found;
  end if;
end;
$$;


-- -----------------------------------------------------------------------------
-- People (profiles), found by email
-- -----------------------------------------------------------------------------
insert into public.profiles (id, display_name, email, role)
select u.id, v.display_name, u.email, v.role::public.user_role
from (values
  ('nila@example.com',   'Nila Akter',  'worker'),
  ('tariq@example.com',  'Tariq Hasan', 'technician'),
  ('hasan@example.com',  'Hasan Ali',   'technician'),
  ('farhan@example.com', 'Farhan Kabir','manager'),
  ('owner@example.com',  'Mr. Rahman',  'owner')
) as v (email, display_name, role)
join auth.users u on u.email = v.email
on conflict (id) do nothing;


-- -----------------------------------------------------------------------------
-- Machines (typed in by hand for the MVP)
-- -----------------------------------------------------------------------------
insert into public.machines (name) values
  ('Sewing machine 01'),
  ('Sewing machine 02'),
  ('Sewing machine 14'),
  ('Cutting machine 03'),
  ('Pressing machine 01')
on conflict (name) do nothing;


-- -----------------------------------------------------------------------------
-- Sample reports (one in each interesting state)
-- -----------------------------------------------------------------------------
-- These are inserted directly because the seed runs with full rights; the
-- apps can only create reports through create_report().
-- A report is skipped if one with the same description already exists.

-- 1. In progress: Tariq accepted it and is working on it (so Tariq is busy).
insert into public.reports
  (machine_id, reported_by, description, status, technician_id, accepted_at, created_at)
select m.id, w.id, 'The needle keeps breaking.', 'in_progress', t.id,
       now() - interval '2 hours 45 minutes', now() - interval '3 hours'
from public.machines m, public.profiles w, public.profiles t
where m.name = 'Sewing machine 14'
  and w.email = 'nila@example.com'
  and t.email = 'tariq@example.com'
  and not exists (select 1 from public.reports r where r.description = 'The needle keeps breaking.');

-- 2. Waiting in the queue: nobody assigned yet.
insert into public.reports (machine_id, reported_by, description, created_at)
select m.id, w.id, 'Thread tension is too tight.', now() - interval '1 hour 30 minutes'
from public.machines m, public.profiles w
where m.name = 'Sewing machine 02'
  and w.email = 'nila@example.com'
  and not exists (select 1 from public.reports r where r.description = 'Thread tension is too tight.');

-- 3. Waiting in the queue: a second one, so the manager has a choice.
insert into public.reports (machine_id, reported_by, description, created_at)
select m.id, w.id, 'Strange noise from the motor.', now() - interval '1 hour'
from public.machines m, public.profiles w
where m.name = 'Cutting machine 03'
  and w.email = 'nila@example.com'
  and not exists (select 1 from public.reports r where r.description = 'Strange noise from the motor.');

-- 4. Resolved yesterday by Hasan: a "past job".
insert into public.reports
  (machine_id, reported_by, description, status, technician_id, accepted_at, created_at)
select m.id, w.id, 'The press does not heat up.', 'resolved', t.id,
       now() - interval '1 day 4 hours', now() - interval '1 day 5 hours'
from public.machines m, public.profiles w, public.profiles t
where m.name = 'Pressing machine 01'
  and w.email = 'nila@example.com'
  and t.email = 'hasan@example.com'
  and not exists (select 1 from public.reports r where r.description = 'The press does not heat up.');
