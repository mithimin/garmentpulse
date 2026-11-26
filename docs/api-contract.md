# GarmentPulse API Contract

**Status:** v1 confirmed by Sakib and **built**. The first 12 functions below exist in the backend (`supabase/migrations/`) and passed the rules check (`supabase/tests/api_rules_check.sql`). **Section 4.7 (sign-up with invite codes) is also BUILT and proven on the real project (decided and built on 2026-10-19; 12 real sign-up checks passed).** Rubaiya and Mithi still review it (plan step ★2).
**Owner:** Sakib (backend). Changes need Sakib's review.
**Expenses and owner approval (sections 3, 4.8, 6 and 7): BUILT IN THE DATABASE and tested on the real project (2026-11-26).** The apps still wait for the ready-made calls and fake data in `packages/shared` and for Sakib's note before building screens.
**Last updated:** 2026-11-26
**Source of truth for product rules:** [`prd.md`](./prd.md) and [`mvp.md`](./mvp.md). **For how things are built:** [`architecture.md`](./architecture.md).

---

## 1. What This File Is (In Plain Words)

The two apps (GarmentPulse Mobile and GarmentPulse Web) and the backend are built by different people. This file is the **written agreement between them**, like a restaurant menu:

- The backend (kitchen) promises to offer these "dishes" (functions).
- The apps (customers) order them using the exact names and details written here.

So Rubaiya and Mithi can build their screens **with fake data and without waiting for the backend**, and Sakib can build the backend **without guessing what the apps need**.

Rules for this file:

- If this file and the PRD or MVP plan disagree about a **product rule**, they win. Fix this file.
- Function names, input names, and error codes here are **exact**. Do not rename them in app code.
- **Adding** a new function is allowed through a pull request that Sakib reviews. **Changing or removing** an existing one must be announced to Rubaiya and Mithi first.
- Items marked **(proposed)** are new ideas added while writing this contract. They are not in `architecture.md` yet. Sakib must confirm them.
- This contract covers the MVP and the **second step** (expenses and owner approval, section 4.8; see [`mvp.md`](./mvp.md) section 3.1). The chatbot, voice, and camera alerts get their own functions later.

---

## 2. Ground Rules for Calling the Backend

### 2.1 How a call looks

The backend is Supabase. Apps call a function like this (TypeScript):

```ts
const { data, error } = await supabase.rpc('create_report', {
  machine_id: '0b2c…',
  description: 'The needle keeps breaking',
});
```

(`rpc` means "remote procedure call": the app asks the database to run one of its ready-made functions.)

- Input names are `snake_case`, exactly as written in this file.
- The apps **never write to tables directly**. They only call functions (architecture NFR-02: roles are checked on the server).
- Every function needs a logged-in user. A call without login fails with `NOT_AUTHENTICATED`.

### 2.2 Errors

When something is wrong, the call returns `error`. Its **`error.message` is a short code in CAPITALS** (for example `TECHNICIAN_BUSY`). The app must **turn the code into a friendly sentence in its own screen text, in both Bangla and English**. Apps never show the raw code to users.

The full list of codes is in Section 6.

### 2.3 Lists

- Lists (reports, machines, technicians) come back in full, newest first. The MVP has no paging.
- **(proposed)** If a factory grows large, paging is added later without changing the names here.

### 2.4 Live updates (Realtime)

A new or changed report must reach the manager's screen **within 5 seconds** (FR-01). Apps get this by subscribing to Supabase Realtime on the `reports` table. Realtime only sends rows the person is allowed to see, so the same security rules apply. Details are in Section 7.

### 2.5 Who is who

| Role | App | Short meaning |
|---|---|---|
| `worker` | Mobile | Reports broken machines |
| `technician` | Mobile | Repairs machines, sends repair costs (4.8) |
| `manager` | Web | Sees all reports, assigns technicians, records expenses (4.8) |
| `owner` | Web | Watches everything; cannot change reports; approves big expenses and sets the limit (4.8) |

A role may only use its own app. Logging in on the wrong app fails with `WRONG_PLATFORM`.

### 2.6 Report statuses

Everyone uses the same three words: `waiting`, `in_progress`, `resolved`.

- A report is **in the queue** when its status is `waiting` and `technician` is `null` (nobody has been assigned yet).
- A report is **assigned** when `technician` is set. It stays `waiting` until the technician starts work.
- Allowed moves: `waiting` → `in_progress` → `resolved`. Nothing moves backwards. `resolved` is final.

### 2.7 Not in the MVP

The AI chatbot, voice input, camera presence alerts, push notifications, free/paid plans, and the 12-month history limit. (Sign-up with invite codes **is** in the MVP: see section 4.7. Only **owner** accounts are still made by hand. Invoices, receipts and owner approval were not in the MVP; they are the second step, section 4.8.)

---

## 3. Data Shapes

These are copied into `packages/shared/src/types.ts`. If they ever disagree, this file wins.

```ts
type Role = 'worker' | 'technician' | 'manager' | 'owner';
type Platform = 'mobile' | 'web';
type ReportStatus = 'waiting' | 'in_progress' | 'resolved';
type TechnicianAvailability = 'free' | 'busy';

type Profile = {
  id: string;
  display_name: string;
  display_name_bn?: string | null; // the name in Bangla letters, if one was written
  email: string;
  role: Role;
  machine?: Machine | null; // a worker's own machine (added 2026-11-22); null when none is assigned
};

type Machine = {
  id: string;
  name: string;
  name_bn?: string | null;
  code?: string | null;
  seat?: string | null; // the fixed place on the Machine map, such as "A3"
  floor?: number | null; // the floor of the factory, 1 to 99
};

type Report = {
  id: string;
  machine: {
    id: string;
    name: string;
    name_bn?: string | null;
    code?: string | null;
    seat?: string | null;
    floor?: number | null;
  };
  description: string;
  status: ReportStatus;
  reported_by: { id: string; display_name: string; display_name_bn?: string | null };
  technician: { id: string; display_name: string; display_name_bn?: string | null } | null; // null = not assigned yet
  accepted_at: string | null; // set when the technician accepts the job
  created_at: string; // ISO date and time
  updated_at: string;
};

type Technician = {
  id: string;
  display_name: string;
  display_name_bn?: string | null;
  availability: TechnicianAvailability;
};

// The live state of one machine, for the worker's machine map (section 4.2)
type MachineState = 'ok' | 'down' | 'waiting' | 'in_progress';
type MachineStateRow = { machine_id: string; state: MachineState }; // nothing else is ever sent

type OwnerSummary = { waiting: number; in_progress: number; resolved: number };

// Expenses and owner approval (section 4.8)
type ExpenseStatus = 'waiting' | 'approved' | 'rejected';
type Person = { id: string; display_name: string; display_name_bn?: string | null };
type Expense = {
  id: string;
  report: { id: string; description: string; machine: Machine };
  amount: number; // taka, more than 0, at most 2 decimals
  reason: string; // what the money was for
  status: ExpenseStatus;
  technician: Person; // who sent it
  invoice_path: string; // where the invoice photo is stored
  receipt_path: string; // where the receipt photo is stored
  limit_at_submit: number | null; // the owner's limit when it was sent; null = no limit was set
  decided_by: Person | null; // the owner; null when nobody had to decide, or not decided yet
  decided_at: string | null;
  rejection_reason: string | null; // set only when rejected
  recorded_by: Person | null; // the manager
  recorded_at: string | null; // null = not recorded yet
  created_at: string;
  updated_at: string;
};
type ExpenseLimit = { amount: number | null; updated_at: string | null }; // null = the owner has not set one

// Sign-up with invite codes (section 4.7)
type InviteRole = 'worker' | 'technician' | 'manager'; // the owner is never created by sign-up
type InviteCode = { code: string; role: InviteRole; created_at: string; expires_at: string };
```

A technician is **busy** when they have at least one assigned report that is not `resolved`, and **free** otherwise. The backend calculates this when reading. It is never stored.

**Bangla names (`display_name_bn`, `name_bn`).** These fields are **optional** and always present in the answers once the backend has them. They are `null` when nobody has written a Bangla name, and then the app shows the English name. **Nothing is generated or translated automatically**: a person types each one (a Bangla speaker for the test data, the person themselves at sign-up, and Sakib for machines). They appear on people (`Profile`, `Technician`, and `reported_by` and `technician` inside a `Report`) and on machines (`Machine`, and `machine` inside a `Report`). A Bangla name is 1 to 80 letters or empty. Report descriptions typed by workers are never changed.

**Machine code (`code`).** An **optional** short label for a machine, such as `SM-01` (Sewing machine 01) or `CM-03` (Cutting machine 03), added on 2026-11-02 for the website's Machine map. It is `null` when a machine has none. Each machine's code is unique, written in capital letters, numbers and dashes (1 to 20 characters), and typed by Sakib: nothing is generated. It appears on machines (`Machine`, and `machine` inside a `Report`). Apps show it next to or under the machine's name.

**Machine seat (`seat`).** An **optional** fixed place of a machine on the website's Machine map, added on 2026-11-07: one capital letter for the row and a place number, for example `A3` (row A, place 3). It is `null` when a machine has none, and the map then sorts by name. A seat is unique **on its floor** (the same seat name is used once on every floor, for example `A1` on floors 1, 2 and 3), and a machine that has a seat must also have a `floor`. It is typed by Sakib. It appears on machines (`Machine`, and `machine` inside a `Report`), next to `code`.

**Machine floor (`floor`).** An **optional** whole number from 1 to 99 for the floor of the factory a machine stands on, added on 2026-11-14 for the worker's machine map. It is `null` when a machine has none. It appears on machines (`Machine`, and `machine` inside a `Report`), next to `code` and `seat`. The row letter and the place number are in `seat` (`A3` = row A, place 3).

---

## 4. Functions

### 4.1 Account and login

#### Log in (Supabase Auth, no custom function)

Email and password. After login the app calls `get_my_profile()`. If the person's role does not belong to this app, the app must sign out and show the message for `WRONG_PLATFORM`.

#### `get_my_profile()` — Mobile, Web

- **Inputs:** none
- **Returns:** `Profile`. For a worker it includes `machine`, the machine that belongs to this worker (`id`, `name`, `name_bn`, `code`, `seat`, `floor`), or `null` when none is assigned yet. `machine` is always `null` for technicians, managers and owners.
- **Rules (added 2026-11-22):** only a worker can have a machine, and one machine belongs to at most one worker (the database enforces both). In the MVP a machine is assigned by hand in SQL; a worker who signs up with a code has none until it is set, and the phone then shows "No machine assigned yet".
- **Errors:** `NOT_AUTHENTICATED`

### 4.2 Machines

#### `list_machines()` — Mobile (worker), Web (manager)

- **Inputs:** none
- **Returns:** `Machine[]` (sorted by name). Feeds the worker's dropdown.
- **Errors:** `NOT_AUTHENTICATED`, `NOT_ALLOWED` (technician and owner do not need it)

#### `list_machine_states()` — Mobile, Web (every logged-in role)

Added on 2026-11-14 for the worker's machine map. A worker may not read other people's reports, so this function gives **only the colour of every machine**, with no report text and no names.

- **Inputs:** none
- **Returns:** `MachineStateRow[]`, one row per machine (sorted by machine name). Each row has exactly two keys, `machine_id` and `state`.
- **The four states:**
  - `ok`: the machine has no open report (a resolved report means `ok` again);
  - `down`: a report is `waiting` and **has no technician yet** (the queue);
  - `waiting`: a technician is **assigned** but has not started (the report is still `waiting`);
  - `in_progress`: the report is `in_progress`.
  If a machine has several open reports, the one furthest along wins: `in_progress`, then `waiting`, then `down`.
- **Live updates:** the same states are kept in a small locked table, `machine_states`, that every logged-in person may **read** (and nobody may write: a trigger in the database keeps it up to date by itself). The apps subscribe to Realtime on `machine_states`, so a change reaches every open map within 5 seconds, like `reports`.
- **Errors:** `NOT_AUTHENTICATED`, `NOT_ALLOWED` (a login with no person behind it)

### 4.3 Reports

#### `create_report(machine_id, description)` — Mobile (worker)

- **Inputs:** `machine_id` (text), `description` (text, 1 to 500 characters after trimming)
- **Returns:** `Report` (status `waiting`, `technician` null: it enters the queue)
- **Errors:** `NOT_AUTHENTICATED`, `NOT_ALLOWED` (not a worker), `NOT_FOUND` (no such machine), `INVALID_INPUT`

#### `list_my_reports()` — Mobile (worker)

- **Inputs:** none
- **Returns:** `Report[]` (only the worker's own reports)
- **Errors:** `NOT_AUTHENTICATED`, `NOT_ALLOWED`

#### `list_reports(status?)` — Web (manager, owner)

- **Inputs:** `status` (optional: one of the three statuses)
- **Returns:** `Report[]` (all reports of the factory)
- **Errors:** `NOT_AUTHENTICATED`, `NOT_ALLOWED` (worker or technician), `INVALID_INPUT`

#### `get_report(report_id)` — Mobile, Web

- **Inputs:** `report_id`
- **Returns:** `Report`
- **Who may see it:** the worker who made it, the technician it is assigned to, the manager, the owner.
- **Errors:** `NOT_AUTHENTICATED`, `NOT_FOUND` (also used when the person may not see it, so nobody can probe for report ids)

### 4.4 Dispatch (manager)

#### `list_technicians()` — Web (manager)

- **Inputs:** none
- **Returns:** `Technician[]` with `availability` (`free` or `busy`)
- **Errors:** `NOT_AUTHENTICATED`, `NOT_ALLOWED`

#### `assign_technician(report_id, technician_id)` — Web (manager)

- **Inputs:** `report_id`, `technician_id`
- **Returns:** `Report` (with `technician` set; status stays `waiting` until the technician starts)
- **Rules:** the technician must be **free**. The report must not be `resolved` and must not already have a technician.
- **Errors:** `NOT_AUTHENTICATED`, `NOT_ALLOWED`, `NOT_FOUND`, `TECHNICIAN_BUSY`, `REPORT_ALREADY_ASSIGNED`, `INVALID_STATUS_CHANGE` (report already resolved)

### 4.5 Technician jobs

#### `list_my_jobs(include_past?)` — Mobile (technician)

- **Inputs:** `include_past` (optional true/false, default false)
- **Returns:** `Report[]` assigned to this technician. With `include_past` true, resolved jobs are included too (this is the "past jobs" list).
- **Errors:** `NOT_AUTHENTICATED`, `NOT_ALLOWED`

#### `accept_job(report_id)` — Mobile (technician)

- **Inputs:** `report_id`
- **Returns:** `Report` (with `accepted_at` set; status is still `waiting`)
- **Errors:** `NOT_AUTHENTICATED`, `NOT_ALLOWED` (not a technician, or the report is assigned to someone else), `NOT_FOUND`, `JOB_ALREADY_ACCEPTED`

#### `update_job_status(report_id, status)` — Mobile (technician)

- **Inputs:** `report_id`, `status` (`in_progress` or `resolved`)
- **Returns:** `Report`
- **Rules:** the technician must have accepted the job first. Moves go forward only (`waiting` → `in_progress` → `resolved`). A technician may jump straight from `in_progress` to `resolved`.
- **Errors:** `NOT_AUTHENTICATED`, `NOT_ALLOWED`, `NOT_FOUND`, `JOB_NOT_ACCEPTED`, `INVALID_STATUS_CHANGE`, `INVALID_INPUT`

### 4.6 Owner view

#### `get_owner_summary()` — Web (owner)

- **Inputs:** none
- **Returns:** `OwnerSummary` (the three count boxes: Waiting, In progress, Resolved)
- **Errors:** `NOT_AUTHENTICATED`, `NOT_ALLOWED`

The owner's list of reports uses `list_reports(status?)`. The owner has no function that changes a **report**. (The owner's actions that change anything are making manager invite codes, section 4.7, and deciding on expenses and setting the expense limit, section 4.8.)

### 4.7 Sign-up with invite codes (decided and built on 2026-10-19)

A new person signs up with an **invite code**. The code decides their role, so nobody can choose a role for themselves.

**The code rules**

- Made by the **owner** (for role `manager`) or by a **manager** (for roles `worker` and `technician`). Nobody else makes codes. **Owner** accounts are never created by sign-up with a code. Sakib approves them by hand: he writes the email, role and name into a locked table, `approved_accounts` (see `supabase/approve_test_accounts.sql`), and the sign-up guard then lets exactly that email in with exactly that role. The same table is used for the test accounts.
- 10 letters and numbers (no look-alike characters such as `0` and `O`). People may type it in capitals or small letters.
- Works **once**, and **expires after 7 days**.
- A new person can log in **right away**. There is no email confirmation in the MVP.

#### Sign-up itself (Supabase Auth, no custom function)

Apps use the ready-made helper `signUpWithCode(client, { platform, fullName, fullNameBn?, email, password, code })` in `packages/shared` (`platform` is `'mobile'` or `'web'`). It returns the new person's `Profile`, and every failure is an `ApiError` whose `code` is one of the codes below. The helper is tested with a pretend client **and proven against the real login service** (the real client check, `supabase/tests/real_client.check.ts`, 12 sign-up checks). Under the hood it does these things in order:

1. Calls `check_invite_code(code)` to get the role, or `INVALID_CODE`.
2. The app makes sure the role belongs to its own platform (a worker or technician code only on the phone app, a manager code only on the website). If not, it stops with `WRONG_PLATFORM`.
3. Calls Supabase Auth's `signUp` with the email, the password and `{ display_name, invite_code }`. The database refuses any sign-up that has neither a good code nor a pre-approved email (no account is created at all), creates the profile with the **role from the code**, and marks the code as used. A session comes back, so the person is logged in. The app then calls `get_my_profile()` like after any login.

Errors from the helper: `INVALID_CODE`, `EMAIL_TAKEN` (that email already has an account), `INVALID_INPUT` (empty name, bad email, or a password that is too short), `WRONG_PLATFORM`.

#### `check_invite_code(code)` — Mobile, Web (works **before** login)

- **Inputs:** `code` (text)
- **Returns:** `{ role: InviteRole }`
- **Errors:** `INVALID_CODE` (wrong, already used, expired, empty or badly formed)

#### `create_invite_code(role)` — Web (owner, manager)

- **Inputs:** `role` (`manager`, `worker` or `technician`)
- **Returns:** `InviteCode`
- **Rules:** the owner may make `manager` codes only. A manager may make `worker` and `technician` codes only.
- **Errors:** `NOT_AUTHENTICATED`, `NOT_ALLOWED` (this person may not make that kind of code), `INVALID_INPUT` (not one of the three roles)

#### `list_invite_codes()` — Web (owner, manager)

- **Inputs:** none
- **Returns:** `InviteCode[]` (only the codes **this person made** that are not yet used and not yet expired, newest first)
- **Errors:** `NOT_AUTHENTICATED`, `NOT_ALLOWED`

### 4.8 Expenses and owner approval (FR-04, FR-05)

Added and built in the database on 2026-11-26. The ready-made calls and fake data for the apps are not in `packages/shared` yet: wait for them and for Sakib's note before building screens.

**The flow**

1. The **technician** sends a cost for their own job, with a photo of the **invoice** and a photo of the **receipt**.
2. The database compares the amount with the **owner's limit** and sets the status:
   - `approved`: the amount is **at or under** the limit;
   - `waiting`: the amount is **over** the limit, **or the owner has not set a limit yet**.
3. For a `waiting` expense the **owner** says yes (`approved`) or no (`rejected`, with a short reason).
4. The **manager** records the expense. Only an `approved` expense can be recorded.

**Rules**

- Every expense needs both photos. No receipt, no expense.
- The status is decided **when the expense is sent**. Changing the limit later does not change older expenses.
- `approved` and `rejected` are final. After a rejection the technician may send a **new** expense; the rejected one stays in the list with the owner's reason.
- One job may have several expenses.
- Nothing is edited or deleted by any app. Recording is not a status: it sets `recorded_by` and `recorded_at`.
- Workers see no expenses.

#### The photos (Supabase Storage, no custom function)

- A **private** storage box (called a bucket) named `expense-photos`.
- The technician **uploads both photos first**, then calls `submit_expense` with the two paths. (This upload is the only thing an app writes without a function. No app writes a table.)
- **Path:** `<the technician's own profile id>/<a new random file name>.jpg` (or `.jpeg`, `.png`).
- **File name:** only the letters A to Z (small or capital), numbers, dashes and underscores, 1 to 100 of them, before the ending. The ending is written in small letters. No spaces, dots or Bangla letters, so do not reuse the phone's own file name. A random id works well.
- Only JPG and PNG, at most **5 MB** each.
- A technician may upload only into their own folder. Nobody may replace or delete a photo.
- **Who may open a photo:** the technician who uploaded it, the manager, the owner. Apps ask for a short-lived link (`createSignedUrl`) each time and never save the link.

#### `submit_expense(report_id, amount, reason, invoice_path, receipt_path)` — Mobile (technician)

- **Inputs:** `report_id`; `amount` (number in taka, more than 0, at most 10,000,000, at most 2 decimals); `reason` (text, 1 to 500 characters after trimming); `invoice_path` and `receipt_path` (the uploaded photos)
- **Returns:** `Expense` (status `approved` or `waiting`)
- **Rules:** the report must be assigned to this technician and be `in_progress` or `resolved`. The two paths must be different, must be in the technician's own folder, and must not be used by another expense.
- **Errors:** `NOT_AUTHENTICATED`, `NOT_ALLOWED` (not a technician, or the report is assigned to someone else), `NOT_FOUND` (no such report), `JOB_NOT_ACCEPTED`, `INVALID_STATUS_CHANGE` (accepted but not started), `RECEIPT_REQUIRED` (a path is empty, or no photo was uploaded there), `INVALID_INPUT`

#### `list_my_expenses()` — Mobile (technician)

- **Inputs:** none
- **Returns:** `Expense[]` (only the ones this technician sent, newest first)
- **Errors:** `NOT_AUTHENTICATED`, `NOT_ALLOWED`

#### `list_expenses(status?)` — Web (manager, owner)

- **Inputs:** `status` (optional: `waiting`, `approved` or `rejected`)
- **Returns:** `Expense[]` (newest first)
- **Errors:** `NOT_AUTHENTICATED`, `NOT_ALLOWED`, `INVALID_INPUT`

#### `get_expense(expense_id)` — Mobile, Web

- **Inputs:** `expense_id`
- **Returns:** `Expense`
- **Who may see it:** the technician who sent it, the manager, the owner.
- **Errors:** `NOT_AUTHENTICATED`, `NOT_FOUND` (also used when the person may not see it)

#### `decide_expense(expense_id, decision, reason?)` — Web (owner)

- **Inputs:** `expense_id`; `decision` (`approved` or `rejected`); `reason` (text, 1 to 300 characters after trimming; **required** for `rejected`, ignored for `approved`)
- **Returns:** `Expense`
- **Errors:** `NOT_AUTHENTICATED`, `NOT_ALLOWED`, `NOT_FOUND`, `EXPENSE_ALREADY_DECIDED` (the status is not `waiting`), `INVALID_INPUT`

#### `record_expense(expense_id)` — Web (manager)

- **Inputs:** `expense_id`
- **Returns:** `Expense` (with `recorded_by` and `recorded_at` set)
- **Errors:** `NOT_AUTHENTICATED`, `NOT_ALLOWED`, `NOT_FOUND`, `EXPENSE_NOT_APPROVED` (still waiting, or rejected), `EXPENSE_ALREADY_RECORDED`

#### `get_expense_limit()` — Web (owner)

- **Inputs:** none
- **Returns:** `ExpenseLimit`
- **Errors:** `NOT_AUTHENTICATED`, `NOT_ALLOWED`

#### `set_expense_limit(amount)` — Web (owner)

- **Inputs:** `amount` (number in taka, 0 to 10,000,000, at most 2 decimals). `0` means every expense waits for the owner. A limit cannot be removed once set, only changed.
- **Returns:** `ExpenseLimit`
- **Errors:** `NOT_AUTHENTICATED`, `NOT_ALLOWED`, `INVALID_INPUT`

---

## 5. Who Calls What

| Function | Worker (Mobile) | Technician (Mobile) | Manager (Web) | Owner (Web) |
|---|---|---|---|---|
| `get_my_profile` | yes | yes | yes | yes |
| `list_machines` | yes | no | yes | no |
| `list_machine_states` | yes | yes | yes | yes |
| `create_report` | yes | no | no | no |
| `list_my_reports` | yes | no | no | no |
| `list_reports` | no | no | yes | yes (read-only) |
| `get_report` | own | assigned | yes | yes |
| `list_technicians` | no | no | yes | no |
| `assign_technician` | no | no | yes | no |
| `list_my_jobs` | no | yes | no | no |
| `accept_job` | no | yes | no | no |
| `update_job_status` | no | yes | no | no |
| `get_owner_summary` | no | no | no | yes |
| `check_invite_code` | before login | before login | before login | no (owners never sign up) |
| `create_invite_code` | no | no | yes (worker and technician codes) | yes (manager codes) |
| `list_invite_codes` | no | no | yes (own codes) | yes (own codes) |
| `submit_expense` | no | yes (own jobs) | no | no |
| `list_my_expenses` | no | yes | no | no |
| `list_expenses` | no | no | yes | yes |
| `get_expense` | no | own | yes | yes |
| `decide_expense` | no | no | no | yes |
| `record_expense` | no | no | yes | no |
| `get_expense_limit` | no | no | no | yes |
| `set_expense_limit` | no | no | no | yes |

---

## 6. Error Codes

| Code | Plain meaning |
|---|---|
| `NOT_AUTHENTICATED` | The person is not logged in (or the login has expired). |
| `WRONG_PLATFORM` | The person's role belongs to the other app (for example a manager logging in on the phone app). |
| `NOT_ALLOWED` | The person's role may not do this. |
| `NOT_FOUND` | The machine, report, or technician does not exist, or the person may not see it. |
| `INVALID_INPUT` | An input is missing, empty, too long, or not one of the allowed values. |
| `TECHNICIAN_BUSY` | The chosen technician already has an unfinished job. |
| `REPORT_ALREADY_ASSIGNED` | The report already has a technician. |
| `JOB_NOT_ACCEPTED` | The technician must accept the job before changing its status. |
| `JOB_ALREADY_ACCEPTED` | The technician already accepted this job. |
| `INVALID_STATUS_CHANGE` | That status move is not allowed (backwards, or the report is already resolved). |
| `INVALID_CODE` | The invite code is wrong, already used, or expired. |
| `EMAIL_TAKEN` | That email already has an account. (Both sign-up codes live in their own list, `SIGN_UP_ERROR_CODES`, until both apps have their sentences. Read them with `getApiErrorCode`.) |
| `RECEIPT_REQUIRED` | An expense needs an uploaded invoice photo and receipt photo. (Section 4.8) |
| `EXPENSE_NOT_APPROVED` | Only an approved expense can be recorded. (Section 4.8) |
| `EXPENSE_ALREADY_DECIDED` | The expense is not waiting for the owner any more. (Section 4.8) |
| `EXPENSE_ALREADY_RECORDED` | The manager already recorded this expense. (Section 4.8) |

The four expense codes will live in their own list, `EXPENSE_ERROR_CODES`, until both apps have their sentences.

These codes live in `packages/shared/src/errors.ts`.

---

## 7. Live Updates and Alerts

- **Realtime (live updates):** the apps subscribe to changes on `reports`. A new report, a new assignment, and every status change reach the worker, technician, manager, and owner who are allowed to see that report, within 5 seconds.
- **Machine states:** the apps may also subscribe to changes on `machine_states` (every logged-in person may read it). A new report, an assignment, a start and a resolve change a machine's state, and the change reaches every open map within 5 seconds. The table holds only a machine id and one of four words.
- **Technician availability** changes whenever a job is assigned or resolved. The manager's screen must refresh the free/busy list when a report changes.
- **Expenses:** apps may also subscribe to changes on `expenses`. The technician (own ones), the manager and the owner receive them, so the manager sees the owner's decision without a refresh.
- **Push notifications** are not in the MVP. In-app live updates are enough.

---

## 8. Decisions and Open Questions

### Decided while writing this contract (confirmed by Sakib on 2026-10-18)

1. **Accepting a job does not change the status.** `accept_job` sets `accepted_at`; the status stays `waiting` until the technician moves it to `in_progress`. This keeps the "3 statuses only" rule from the design system.
2. **The queue is not a status.** A queued report is `waiting` with no technician.
3. **One factory in the MVP.** Everyone belongs to one factory, so no function takes a factory id. Several factories can be added later.
4. **No auto-assign.** When a technician becomes free, the manager assigns the next queued report by hand.

### Decided for expenses (by Sakib, 2026-11-26)

- Expenses and owner approval are the **second step** and start now.
- **Both photos are required** (invoice and receipt).
- **Before the owner sets a limit, every expense waits for the owner.**
- **A rejected expense stays**, and the technician may send a new one.

### Answered (by Sakib, 2026-10-18)

- **How do accounts and roles get created?** *(Changed on 2026-10-19; it was "by hand only" on 2026-10-18.)* People **sign up with an invite code** (section 4.7). The owner makes manager codes, and a manager makes worker and technician codes. The code decides the role. A code works once and expires after 7 days. There is no email confirmation. **Owner accounts** are still made by hand by Sakib. The earlier idea of functions named `sign_up`, `create_manager_code` and `list_manager_codes` became `check_invite_code`, `create_invite_code` and `list_invite_codes`, plus the helper `signUpWithCode`.
- **How is the code enforced?** By a guard in the database that runs at sign-up and refuses any sign-up without a good code. A small function, `check_invite_code`, lets the apps ask first, so they can show a clear `INVALID_CODE` message.
- **Bangla names for people and machines** (accepted 2026-10-19, built 2026-10-20). Optional fields `display_name_bn` and `name_bn`, `null` when nobody wrote one (see section 3). A person types them: at sign-up there is an **optional "name in Bangla" box** (`fullNameBn` in `signUpWithCode`, saved as `display_name_bn` by the sign-up guard; longer than 80 letters is refused with `INVALID_INPUT`). A pre-approved account can carry one too. Machines get theirs from Sakib. Nothing is translated automatically.
- **Where do the machines come from?** Typed in by hand as test data (`supabase/seed.sql`). No function adds machines in the MVP.
- **Can a manager reassign a report** after it was assigned? **No**, not in the MVP.
- **Which status moves are allowed for a technician?** Any forward move after the job is accepted: `waiting` to `in_progress` to `resolved`, and also straight from `waiting` to `resolved`. Backwards moves and repeats give `INVALID_STATUS_CHANGE`.
- **One unfinished job per technician.** The database enforces it, so a second assignment gives `TECHNICIAN_BUSY` even if two managers try at the same moment.

### Still open (the team must answer before the related step)

- **Word list (plan step ★3):** the exact Bangla and English words for the three statuses and the free/busy labels are still to be agreed.

---

## 9. How This File Will Be Used

1. Rubaiya and Mithi build screens against **fake data** that has exactly the shapes in Section 3.
2. Sakib builds the real functions to match Sections 4 and 6.
3. In Round 4 (★4), the apps swap fake data for real calls. Nothing should need renaming, because the names are already agreed here.
4. Database tests check every function against this file.
