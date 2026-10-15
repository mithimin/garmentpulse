# GarmentPulse - Supabase Setup Steps (MVP)

**Project:** GarmentPulse
**Course:** CSE327, Group 2
**Status:** PROPOSAL. It follows [backend-proposal.md](backend-proposal.md). Run it only after Rubaiya and Mithi have approved the tables and permissions (★1 and ★2 in [plan.md](plan.md)).
**Written by:** Md. Sakibuzzaman (backend)
**Document purpose:** This file explains, step by step and in simple words, how to create the one shared Supabase project for the MVP, build the tables, switch on the role rules, add test people, and check that it works. Anyone reading it later should be able to rebuild the backend from zero.

**Related documents:**

- [backend-proposal.md](backend-proposal.md) - the tables, permissions and API list this file builds.
- [architecture.md](architecture.md) - why we use Supabase and PostgreSQL.
- [mvp.md](mvp.md) - what the MVP must do.

---

## 1. Before you start

- One person (Sakib) creates **one** Supabase project for the whole team. Nobody makes their own copy.
- Keys and passwords **never** go to GitHub. See section 7.
- Do the steps in order. Each step says how to check it worked.

---

## 2. Step 1: Create the project

1. Go to supabase.com and log in.
2. Click **New project**. Name it `garmentpulse`.
3. Choose a region **close to Bangladesh** (for example Singapore) so the app is fast.
4. Set a strong database password and save it in a private place (not in GitHub).
5. Wait until the project is ready.

**Check:** the project dashboard opens.

---

## 3. Step 2: Create the tables

Open **SQL Editor** in the dashboard, paste the code below, and click **Run**.

```sql
-- Two small lists of allowed words
create type public.user_role     as enum ('worker', 'technician', 'manager', 'owner');
create type public.report_status as enum ('waiting', 'in_progress', 'resolved');

-- 1. One row per person. The id is the same as the Supabase login id.
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null,
  role        public.user_role not null,
  language    text not null default 'en' check (language in ('en', 'bn')),
  created_at  timestamptz not null default now()
);

-- 2. The factory machines shown in the worker's dropdown.
create table public.machines (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  location    text,
  is_active   boolean not null default true
);

-- 3. A problem reported by a worker.
create table public.reports (
  id           uuid primary key default gen_random_uuid(),
  machine_id   uuid not null references public.machines (id),
  reported_by  uuid not null references public.profiles (id),
  description  text not null check (length(trim(description)) > 0),
  status       public.report_status not null default 'waiting',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 4. Which technician takes which report. One report has one assignment.
create table public.assignments (
  id             uuid primary key default gen_random_uuid(),
  report_id      uuid not null unique references public.reports (id),
  technician_id  uuid not null references public.profiles (id),
  assigned_by    uuid not null references public.profiles (id),
  accepted_at    timestamptz,
  finished_at    timestamptz,
  created_at     timestamptz not null default now()
);

-- Helpful for fast lists
create index on public.reports (status, created_at desc);
create index on public.reports (reported_by);
create index on public.assignments (technician_id);
```

**Check:** in **Table Editor** you see `profiles`, `machines`, `reports` and `assignments`.

---

## 4. Step 3: Switch on the role rules (security)

The server decides who can do what. Run this in the SQL Editor.

```sql
-- A small helper that tells us the role of the person who is asking.
create or replace function public.get_my_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Turn on row security: nobody sees anything unless a rule allows it.
alter table public.profiles    enable row level security;
alter table public.machines    enable row level security;
alter table public.reports     enable row level security;
alter table public.assignments enable row level security;

-- Nobody who is not logged in can touch anything.
revoke all on public.profiles, public.machines, public.reports, public.assignments from anon;

-- People can only READ or CREATE through rules. Changes to jobs go through
-- the two safe functions below, not through direct edits.
revoke insert, update, delete on public.assignments from authenticated;
revoke update, delete         on public.reports     from authenticated;
revoke insert, delete         on public.profiles    from authenticated;
revoke insert, update, delete on public.machines    from authenticated;
-- A person may change only their own language.
revoke update on public.profiles from authenticated;
grant  update (language) on public.profiles to authenticated;

-- profiles: you see yourself; manager and owner see everyone.
create policy profiles_read on public.profiles for select to authenticated
  using (id = auth.uid() or public.get_my_role() in ('manager', 'owner'));
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- machines: every logged-in person can read them.
create policy machines_read on public.machines for select to authenticated
  using (true);

-- reports: worker sees own, technician sees the ones assigned to them,
-- manager and owner see all.
create policy reports_read on public.reports for select to authenticated
  using (
    reported_by = auth.uid()
    or public.get_my_role() in ('manager', 'owner')
    or exists (
      select 1 from public.assignments a
      where a.report_id = reports.id and a.technician_id = auth.uid()
    )
  );
-- Only a worker can create a report, only as themselves, and always "waiting".
create policy reports_create on public.reports for insert to authenticated
  with check (
    public.get_my_role() = 'worker'
    and reported_by = auth.uid()
    and status = 'waiting'
  );

-- assignments: technician sees own; manager and owner see all.
create policy assignments_read on public.assignments for select to authenticated
  using (technician_id = auth.uid() or public.get_my_role() in ('manager', 'owner'));
```

**Check:** in **Authentication > Policies** each of the 4 tables shows its rules.

---

## 5. Step 4: Dispatch, status and free/busy

Run this in the SQL Editor. These are the only safe ways to assign and update jobs.

```sql
-- Manager assigns a free technician to a waiting report.
create or replace function public.assign_report(p_report_id uuid, p_technician_id uuid)
returns public.assignments
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.assignments;
begin
  if public.get_my_role() is distinct from 'manager' then
    raise exception 'Only a manager can assign a technician';
  end if;
  if not exists (select 1 from public.profiles where id = p_technician_id and role = 'technician') then
    raise exception 'That person is not a technician';
  end if;
  if exists (select 1 from public.assignments
             where technician_id = p_technician_id and finished_at is null) then
    raise exception 'That technician is busy';
  end if;
  if not exists (select 1 from public.reports where id = p_report_id and status = 'waiting') then
    raise exception 'That report is not waiting';
  end if;

  insert into public.assignments (report_id, technician_id, assigned_by)
  values (p_report_id, p_technician_id, auth.uid())
  returning * into v_row;   -- a second assignment for the same report fails here

  return v_row;
end;
$$;

-- Technician accepts (in_progress) or finishes (resolved) their own job.
create or replace function public.update_job_status(p_report_id uuid, p_status public.report_status)
returns public.reports
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current public.report_status;
  v_row     public.reports;
begin
  if public.get_my_role() is distinct from 'technician' then
    raise exception 'Only a technician can change a job';
  end if;
  if not exists (select 1 from public.assignments
                 where report_id = p_report_id and technician_id = auth.uid()) then
    raise exception 'This job is not yours';
  end if;

  select status into v_current from public.reports where id = p_report_id;

  if p_status = 'in_progress' and v_current = 'waiting' then
    update public.assignments set accepted_at = now()
      where report_id = p_report_id;
  elsif p_status = 'resolved' and v_current = 'in_progress' then
    update public.assignments set finished_at = now()
      where report_id = p_report_id;
  else
    raise exception 'That status change is not allowed';
  end if;

  update public.reports set status = p_status, updated_at = now()
    where id = p_report_id
    returning * into v_row;

  return v_row;
end;
$$;

-- Only logged-in people may call the two functions.
revoke all on function public.assign_report(uuid, uuid)            from public, anon;
revoke all on function public.update_job_status(uuid, public.report_status) from public, anon;
grant execute on function public.assign_report(uuid, uuid)            to authenticated;
grant execute on function public.update_job_status(uuid, public.report_status) to authenticated;

-- Free or busy for each technician. Rules above decide who can see it.
create or replace view public.technician_availability
with (security_invoker = true) as
select
  p.id,
  p.full_name,
  not exists (
    select 1 from public.assignments a
    where a.technician_id = p.id and a.finished_at is null
  ) as is_free
from public.profiles p
where p.role = 'technician';

-- Live updates: the manager list changes within seconds.
alter publication supabase_realtime add table public.reports, public.assignments;
```

**Check:** in **Database > Functions** you see `assign_report`, `update_job_status` and `get_my_role`.

---

## 6. Step 5: Add test people and machines

Test people are fake. Their passwords are for testing only.

1. Open **Authentication > Users > Add user**. Create 5 users with made-up emails (for example `worker1@test.local`) and tick **Auto confirm**. Use a different test password, kept in a private place.
   - 1 worker, 2 technicians, 1 manager, 1 owner.
2. For each user, copy their **User UID**.
3. In the SQL Editor, run this after replacing every `PASTE-UID-HERE`:

```sql
insert into public.profiles (id, full_name, role) values
  ('PASTE-UID-HERE', 'Test Worker',       'worker'),
  ('PASTE-UID-HERE', 'Test Technician 1', 'technician'),
  ('PASTE-UID-HERE', 'Test Technician 2', 'technician'),
  ('PASTE-UID-HERE', 'Test Manager',      'manager'),
  ('PASTE-UID-HERE', 'Test Owner',        'owner');

insert into public.machines (name, location) values
  ('Sewing machine 1', 'Line 1'),
  ('Sewing machine 2', 'Line 1'),
  ('Cutting machine 1', 'Line 2'),
  ('Iron press 1',     'Line 3'),
  ('Button machine 1', 'Line 3');
```

**Check:** `select * from public.profiles;` shows 5 rows and `select * from public.machines;` shows 5 rows.

---

## 7. Keys and secrets

Supabase shows two keys under **Project Settings > API**.

| Key | Where it may be used | Rule |
|---|---|---|
| **anon / publishable key** | Mobile and web apps | May be in the apps. It is only safe because of the rules in step 3. |
| **service_role key** | Backend scripts only | **Secret.** Never in an app, never in GitHub. It skips all the rules. |

- Put keys in a `.env` file that is listed in `.gitignore`.
- Share keys with teammates through a private message, not through GitHub.
- If a secret key is ever pushed by mistake, treat it as stolen and create a new one in the Supabase dashboard.

---

## 8. Test that the rules work

Use Postman (or the apps) and log in as each test person. All of these must behave as written.

| # | Logged in as | Try | Must happen |
|---|---|---|---|
| 1 | Worker | Create a report | Works. Status is `waiting`. |
| 2 | Worker | Read all reports | Sees only their own. |
| 3 | Worker | Call `assign_report` | Error: only a manager. |
| 4 | Manager | Read all reports | Sees every report. |
| 5 | Manager | `assign_report` to a free technician | Works. |
| 6 | Manager | `assign_report` to a busy technician | Error: busy. |
| 7 | Technician 1 | Read reports | Sees only their own jobs. |
| 8 | Technician 2 | `update_job_status` on Technician 1's job | Error: not yours. |
| 9 | Technician 1 | Accept, then resolve their job | Works, in that order only. |
| 10 | Owner | Read all reports | Works. |
| 11 | Owner | Change or create anything | Error. |
| 12 | Not logged in | Read anything | Error. |

Also check the **5-second rule**: create a report and watch how fast it appears in a live list.

---

## 9. After this

- Move this SQL into a file in the `/backend` folder, so the setup is saved with the code.
- Rubaiya and Mithi switch from fake data to this backend in shared step ★4.
- When invoices and owner approval are built later, new tables are added in the same way.
