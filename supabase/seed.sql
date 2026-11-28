-- =============================================================================
-- Test data (seed) for GarmentPulse
-- =============================================================================
-- What this file does, in plain words:
--   Fills the database with a small, realistic "story" so everyone can try
--   the real functions: 5 people, 45 machines and 4 reports. The names follow
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
-- BEFORE YOU RUN THIS FILE: approve and create the 5 logins by hand
--   (this file never contains a password, on purpose).
--   First run supabase/approve_test_accounts.sql. Since the sign-up guard
--   (migration 9) exists, a login can only be created for an approved email;
--   the guard then also creates each profile by itself.
--   Then: Supabase dashboard > Authentication > Users > Add user > Create new user.
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
-- 45 machines on 3 floors, each floor 3 rows (A, B, C) of 5 seats, exactly the
-- machines of the website's Machine map (a 2026-11-14 team request).
-- The 5 machines of the first version (Sewing machine 01, 02, 14, Cutting machine 03,
-- Pressing machine 01) are the SAME machines: if they already exist they MOVE to their
-- new floor and seat (so old reports keep pointing at them), they are not copied.
-- First every seat is cleared, so the machines can move without two of them ever
-- being in one place for a moment.
update public.machines set seat = null where seat is not null;

insert into public.machines (name, code, seat, floor) values
  ('Buttonhole machine 01', 'BH-01', 'A1', 1),
  ('Buttonhole machine 02', 'BH-02', 'A2', 1),
  ('Buttonhole machine 03', 'BH-03', 'A3', 1),
  ('Cutting machine 01', 'CM-01', 'A4', 1),
  ('Cutting machine 02', 'CM-02', 'A5', 1),
  ('Cutting machine 03', 'CM-03', 'B1', 1),
  ('Cutting machine 04', 'CM-04', 'B2', 1),
  ('Cutting machine 05', 'CM-05', 'B3', 1),
  ('Overlock machine 01', 'OL-01', 'B4', 1),
  ('Overlock machine 02', 'OL-02', 'B5', 1),
  ('Overlock machine 03', 'OL-03', 'C1', 1),
  ('Overlock machine 04', 'OL-04', 'C2', 1),
  ('Overlock machine 05', 'OL-05', 'C3', 1),
  ('Overlock machine 06', 'OL-06', 'C4', 1),
  ('Overlock machine 07', 'OL-07', 'C5', 1),
  ('Overlock machine 08', 'OL-08', 'A1', 2),
  ('Pressing machine 01', 'PM-01', 'A2', 2),
  ('Pressing machine 02', 'PM-02', 'A3', 2),
  ('Pressing machine 03', 'PM-03', 'A4', 2),
  ('Pressing machine 04', 'PM-04', 'A5', 2),
  ('Sewing machine 01', 'SM-01', 'B1', 2),
  ('Sewing machine 02', 'SM-02', 'B2', 2),
  ('Sewing machine 03', 'SM-03', 'B3', 2),
  ('Sewing machine 04', 'SM-04', 'B4', 2),
  ('Sewing machine 05', 'SM-05', 'B5', 2),
  ('Sewing machine 06', 'SM-06', 'C1', 2),
  ('Sewing machine 07', 'SM-07', 'C2', 2),
  ('Sewing machine 08', 'SM-08', 'C3', 2),
  ('Sewing machine 09', 'SM-09', 'C4', 2),
  ('Sewing machine 10', 'SM-10', 'C5', 2),
  ('Sewing machine 11', 'SM-11', 'A1', 3),
  ('Sewing machine 12', 'SM-12', 'A2', 3),
  ('Sewing machine 13', 'SM-13', 'A3', 3),
  ('Sewing machine 14', 'SM-14', 'A4', 3),
  ('Sewing machine 15', 'SM-15', 'A5', 3),
  ('Sewing machine 16', 'SM-16', 'B1', 3),
  ('Sewing machine 17', 'SM-17', 'B2', 3),
  ('Sewing machine 18', 'SM-18', 'B3', 3),
  ('Sewing machine 19', 'SM-19', 'B4', 3),
  ('Sewing machine 20', 'SM-20', 'B5', 3),
  ('Sewing machine 21', 'SM-21', 'C1', 3),
  ('Sewing machine 22', 'SM-22', 'C2', 3),
  ('Sewing machine 23', 'SM-23', 'C3', 3),
  ('Sewing machine 24', 'SM-24', 'C4', 3),
  ('Sewing machine 25', 'SM-25', 'C5', 3)
on conflict (name) do update set
  code = excluded.code,
  seat = excluded.seat,
  floor = excluded.floor;


-- -----------------------------------------------------------------------------
-- Each worker's own machine (migration 20261122100000)
-- -----------------------------------------------------------------------------
-- A worker always works at the same machine. Nila works at Sewing machine 14, the
-- machine of her first report. (Only workers may have a machine, and no two workers
-- may share one; both rules are enforced by the database.) Safe to run twice.
update public.profiles p
set machine_id = m.id
from public.machines m
where p.email = 'nila@example.com'
  and m.name = 'Sewing machine 14';


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
