# GarmentPulse - Backend Proposal (MVP)

**Project:** GarmentPulse
**Course:** CSE327, Group 2
**Status:** PROPOSAL. Nothing here is final until Rubaiya and Mithi have reviewed it (shared steps ★1 and ★2 in [plan.md](plan.md)).
**Written by:** Md. Sakibuzzaman (backend)
**Document purpose:** This file explains, in simple words, what the **database tables**, the **permissions** and the **API list** should look like for the MVP. The mobile and web apps can use it to build their screens with fake data while the real backend is being built. Anyone reading it later should understand how the MVP data is organized.

**Related documents:**

- [mvp.md](mvp.md) - which features are in the first version.
- [architecture.md](architecture.md) - the technology (Supabase and PostgreSQL) and the quality rules.
- [plan.md](plan.md) - who builds what, and the shared steps ★1 to ★6.

---

## 1. How to review this file

For each section, reply with one of: **OK**, **change this**, or **question**. Open questions are listed in section 6. When all three of us agree, this file becomes the agreement for ★1 and ★2.

---

## 2. Database tables (★1)

Only what the MVP needs. Expenses, invoices and approvals are **not** here because they are later (see [mvp.md](mvp.md) section 3).

### 2.1 `profiles` - one row per person

| Column | What it holds |
|---|---|
| `id` | Same id as the Supabase login user |
| `full_name` | The person's name |
| `role` | `worker`, `technician`, `manager` or `owner` |
| `language` | `bn` (Bangla) or `en` (English), the person's choice |
| `created_at` | When the profile was made |

### 2.2 `machines` - the factory machines

| Column | What it holds |
|---|---|
| `id` | Unique id |
| `name` | Name or number shown in the dropdown, for example "Sewing machine 12" |
| `location` | Where it is, for example "Line 3" (optional) |
| `is_active` | `true` if it should show in the dropdown |

### 2.3 `reports` - a problem reported by a worker

| Column | What it holds |
|---|---|
| `id` | Unique id |
| `machine_id` | Which machine is broken |
| `reported_by` | The worker who reported it |
| `description` | The short text describing the problem |
| `status` | `waiting`, `in_progress` or `resolved` |
| `created_at` | When it was reported |
| `updated_at` | When it last changed |

### 2.4 `assignments` - which technician takes which report

| Column | What it holds |
|---|---|
| `id` | Unique id |
| `report_id` | The report being fixed |
| `technician_id` | The technician who got the job |
| `assigned_by` | The manager who assigned it |
| `accepted_at` | When the technician accepted (empty until then) |
| `finished_at` | When the job was resolved (empty until then) |
| `created_at` | When it was assigned |

### 2.5 How "free" and "busy" and the "queue" work

- A technician is **busy** when they have an assignment that is not finished. Otherwise they are **free**. No extra column is needed, so the answer cannot go out of date.
- A report is **in the queue** when its status is `waiting` and it has no assignment.
- Status flow: `waiting` -> `in_progress` (technician accepts) -> `resolved` (technician finishes).

---

## 3. Who can do what (★1)

The server checks this on every request (rule NFR-02 in [architecture.md](architecture.md)). The apps only hide buttons.

| Action | Worker | Technician | Manager | Owner |
|---|---|---|---|---|
| Create a report | Yes | No | No | No |
| See **own** reports | Yes | - | - | - |
| See **all** reports | No | No | Yes | Yes (read-only) |
| See machines list | Yes | Yes | Yes | Yes |
| See technicians and free/busy | No | No | Yes | No |
| Assign a technician | No | No | Yes | No |
| See **own** jobs | No | Yes | - | - |
| Accept a job and change its status | No | Yes (own jobs only) | No | No |
| See past jobs | No | Yes (own) | Yes (all) | Yes (all, read-only) |
| Add or change users and machines | No | No | No | No (done by the backend team in the MVP) |

Things that must **never** be possible:

- A worker opens manager or owner data, even by typing an address.
- A technician changes a job that is not theirs.
- The owner changes anything.

---

## 4. API list (★2)

Supabase creates the basic API from the tables. This list says what each screen needs, so the apps and the backend agree. Names are proposals.

| Screen | Who | Action | Sends | Gets back |
|---|---|---|---|---|
| Login | All | Log in | email, password | the person's `profile` (including `role`) |
| Report a problem | Worker | Create report | `machine_id`, `description` | the new report |
| Machine dropdown | Worker | List machines | - | list of active machines |
| My reports | Worker | List own reports | - | reports with status, newest first |
| All reports | Manager, Owner | List all reports | optional status filter | reports with machine, worker, status, technician (if any) |
| Technicians | Manager | List technicians | - | each technician with free or busy |
| Assign | Manager | Assign technician | `report_id`, `technician_id` | the new assignment |
| My jobs | Technician | List own jobs | - | open assignments with report details |
| Accept / change status | Technician | Update status | `report_id`, new `status` | the updated report |
| Past jobs | Technician | List finished jobs | - | finished assignments |
| Live updates | Manager, Owner, Worker | Listen for changes | - | a message when a report or status changes |

**Speed rule:** a new report must reach the manager's list within **5 seconds** (see [mvp.md](mvp.md) section 5). Live updates are how this is met.

---

## 5. Test data we will prepare

So everyone tests with the same facts:

- 1 worker, 2 technicians, 1 manager, 1 owner.
- About 5 machines with simple names.
- A few reports in each status.

Test passwords are made up for testing only and are **never** the real passwords of any person. Real keys and secrets never go into GitHub.

---

## 6. Open questions for the team

1. Can a worker see only their **own** reports, or the reports of everyone on their line?
2. When a technician becomes free, should the oldest waiting report be assigned **automatically**, or should the manager always decide? (Proposal: manager decides.)
3. Can a technician **reject** a job, or only accept it? (Proposal: accept only in the MVP.)
4. Is one status enough (`waiting`, `in_progress`, `resolved`), or do we need more, such as `cancelled`?
5. Who adds machines and users in the MVP? (Proposal: the backend team, using test data.)
6. Should a worker be able to **cancel** or edit a report after sending it? (Proposal: no.)
