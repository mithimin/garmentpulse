-- =============================================================================
-- Migration 15: a seat is unique PER FLOOR, and a seat needs a floor
-- =============================================================================
-- What this file does, in plain words:
--   Migration 13 said a seat such as A1 can exist only once in the whole
--   factory. But the factory has several floors, and every floor has its own
--   row A, place 1. So the rule becomes:
--     1. Two machines on the SAME floor can never share a seat. The same seat
--        name on DIFFERENT floors is fine (floor 1 A1, floor 2 A1, floor 3 A1).
--     2. A machine that has a seat must also have a floor, because a seat only
--        means something on a floor.
--   Nothing is deleted or changed in the data: the 5 machines that exist today
--   are all on floor 1 with different seats, so both rules already hold.
--
-- Why: the Machine map has 3 floors of 3 rows of 5 seats (45 machines). Mithi asked
-- for it in requests/sakib/2026-11-14-more-machines-for-the-map.md. The 45
-- machines themselves are put in by supabase/seed.sql (test data).
--
-- Nothing else changes: the same functions, inputs, permissions and error codes.
--
-- Rules for this folder (see supabase/CLAUDE.md):
--   * Never edit an old migration. Add a NEW file for every change.
-- =============================================================================

-- 1. Unique per floor (the old rule was unique in the whole factory).
alter table public.machines drop constraint machines_seat_key;
alter table public.machines add constraint machines_floor_seat_key unique (floor, seat);

-- 2. A seat needs a floor.
alter table public.machines
  add constraint machines_seat_needs_floor check (seat is null or floor is not null);
