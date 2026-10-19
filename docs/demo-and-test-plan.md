# GarmentPulse - Test Checklist and Demo Script

**Project:** GarmentPulse
**Course:** CSE327, Group 2
**Document purpose:** This file explains, in simple words, **how the three of us test the whole MVP together** (shared steps ★5 and ★6 in [plan.md](plan.md)) and **how we show it** in the final demo. Part 1 is the checklist for the test. Part 2 is the script for the demo. Anyone reading it later should be able to repeat the test and the demo without asking the team.

**Related documents:**

- [mvp.md](mvp.md) - section 5, "Done means done", is the list this checklist proves.
- [api-contract.md](api-contract.md) - the exact error codes you will see named below.
- [plan.md](plan.md) - who builds what.

---

## 0. Who does what

| Person | Device | Role in the test |
|---|---|---|
| **Rubaiya** | A phone with the phone app | Worker and technician screens |
| **Mithi** | A laptop with the website | Manager and owner screens |
| **Sakib** | A laptop with the Supabase dashboard and a terminal | Backend, test data, clean-up |

### The test people

All accounts are made up. **Passwords are never written in git or in this file.** Sakib gives each person only their own passwords in a private message.

| Email | Role | App |
|---|---|---|
| `nila@example.com` | worker | Phone |
| `tariq@example.com` | technician | Phone |
| `hasan@example.com` | technician | Phone |
| `farhan@example.com` | manager | Website (`/login`) |
| `owner@example.com` | owner | Website (`/owner-login`) |

---

## 1. Before every run (a clean start)

Do these in order. They take about 10 minutes. Skip none, because a leftover test report or a used-up code makes the checks confusing.

| # | Step | Who | How |
|---|---|---|---|
| 1 | Get the latest code | everyone | `git pull` on `main`, then `npm install` |
| 2 | Put the test data back to the story | Sakib | In the Supabase SQL Editor, run `supabase/reset_demo_data.sql`, then `supabase/seed.sql` |
| 3 | Delete leftover pretend accounts and codes | Sakib | Run the `delete` lines that the last real check printed (see section 5) |
| 4 | Sign-up is **on**, email confirmation is **off** | Sakib | Supabase dashboard, Authentication, Email |
| 5 | The apps point at the real project | Rubaiya, Mithi | Each has a private `.env` file with the web address and the public key (`.env.example` shows the names) |
| 6 | The backend rules pass | Sakib | Run `supabase/tests/api_rules_check.sql` (it must say ALL 101 CHECKS PASSED), then `node supabase/tests/run_real_check.mjs` |
| 7 | Both apps start | Rubaiya, Mithi | Phone: `npm run start --workspace @garmentpulse/mobile`. Website: `npm run dev --workspace @garmentpulse/web`, then open `http://localhost:3000` |

**The starting story** after step 2: Nila has reported 4 problems. Tariq is **busy** (one job in progress). Hasan is **free** and has one past job. Two reports are waiting in the **queue**.

---

## 2. Part 1: the test checklist

Tick a box only when you **saw** it with your own eyes, on a real screen. Write what you saw in the "Result" column if it was not as expected.

### 2.1 The report-and-repair story (MVP checklist items 1 to 5)

| ID | Who | Steps | What must happen | Result |
|---|---|---|---|---|
| **T1** | Rubaiya | On the phone, log in as Nila (choose "Worker"). Open "Report". Pick a machine, type "Belt is loose", send. | "Report sent". The report shows in "My reports" as **Waiting** (yellow). | [ ] |
| **T2** | Mithi | On the website, be logged in as Farhan on the Dashboard **before** T1. Do **not** refresh. | The new report appears in the list **within 5 seconds**, marked "In the queue". (Count the seconds.) | [ ] |
| **T3** | Mithi | Press "Assign" on that report. | The pop-up lists technicians. **Tariq is greyed out (busy)**, Hasan is free. Choose Hasan. | [ ] |
| **T4** | Rubaiya | On a second phone, or after logging out, log in as Hasan (choose "Technician"). | The job appears in "Jobs" **within 5 seconds**. | [ ] |
| **T5** | Rubaiya | As Hasan: Accept job, then Start work. | Status becomes **In progress** (blue). Nila's phone (or Mithi's list) shows the change **within 5 seconds**. | [ ] |
| **T6** | Rubaiya | As Hasan: Mark as fixed. | Status becomes **Resolved** (green). The job moves to "History" (past jobs). Hasan is **free** again. | [ ] |
| **T7** | Mithi | Open the **Technicians** page as Farhan. | Hasan shows **Free**. Tariq still shows **Busy**. | [ ] |
| **T8** | Mithi | Make the **queue**: assign Hasan to one waiting report. Then try to assign a **second** report to Tariq or Hasan while both are busy. | Busy technicians are greyed out in the pop-up. The other report **stays in the queue**. A wrong attempt shows a friendly sentence (never the raw code `TECHNICIAN_BUSY`). | [ ] |
| **T9** | Mithi | Log out. On the owner login (`/owner-login`), log in as the owner. | One read-only dashboard: three count boxes (Waiting, In progress, Resolved) and the list of all reports. **No Assign button.** The counts match what the manager sees. | [ ] |

### 2.2 "Nobody can do someone else's job" (MVP checklist item 6)

| ID | Who | Steps | What must happen | Result |
|---|---|---|---|---|
| **T10** | Mithi | Log out. Type `http://localhost:3000/manager` in the address bar. | You are sent to the login page. | [ ] |
| **T11** | Mithi | Log in as the **owner**, then type `/manager` in the address bar. | "You cannot open this page" (or similar). The same the other way: log in as the manager, type `/owner`. | [ ] |
| **T12** | Mithi | Try to log in on the website as **Nila** (a worker). | The login is refused with the "wrong app" sentence (`WRONG_PLATFORM`). | [ ] |
| **T13** | Rubaiya | Try to log in on the phone as **Farhan** (a manager). | Refused with the "wrong app" sentence. | [ ] |
| **T14** | Sakib | In the terminal: `node supabase/tests/run_real_check.mjs`. | `Tests 28 passed (28)`. This proves, with the real login service, that a worker cannot list all reports, assign, or make codes. | [ ] |

### 2.3 Languages (MVP checklist item 7)

| ID | Who | Steps | What must happen | Result |
|---|---|---|---|---|
| **T15** | Rubaiya | Phone: press the language button (top right) on the login, Home, Report, My reports, Jobs and History screens. | Everything switches between English and Bangla. No English words stay in Bangla mode, **except** people's and machines' names (they wait for the Bangla names). | [ ] |
| **T16** | Mithi | Website: the same on the login pages, Dashboard, Reports, Technicians, Owner. | Same as above. Buttons and dates do not break onto two lines. | [ ] |
| **T17** | Both | Cause an error on purpose (a wrong password). | The sentence is friendly and in the chosen language. The raw code never shows. | [ ] |

> The Bangla words are still a **draft**. A Bangla speaker should read them before the demo (see [mvp.md](mvp.md) section 5, item 7). Do not tick T15 to T17 for the final run until one has.

### 2.4 Sign-up with invite codes (MVP checklist items 8 to 10)

| ID | Who | Steps | What must happen | Result |
|---|---|---|---|---|
| **T18** | Mithi | Log in as the **owner**. Open "Manager codes". Press "Create a manager code". | A new code of 10 letters and numbers appears in the list. | [ ] |
| **T19** | Mithi | Open a **private window**, go to `/signup`. Enter a name, a new email, a password (6 or more letters) and that code. | You land on the **manager** page, already logged in. | [ ] |
| **T20** | Mithi | Back as the owner: look at the codes list. Then repeat T19 with the **same code**. | The used code is gone from the list. The second attempt is refused with the "wrong, used or too old" sentence. | [ ] |
| **T21** | Mithi | As the new manager, open "Invite codes". Press "Create a worker code" and "Create a technician code". | Both appear. A manager cannot make a manager code. | [ ] |
| **T22** | Rubaiya | On the phone, sign up with the worker code. | You land on the worker screens, logged in. The role is worker, and you cannot choose another. | [ ] |
| **T23** | Rubaiya | Try the **manager** code on the phone, and a **made-up** code. | Both are refused with friendly sentences, and **no account is created**. | [ ] |
| **T24** | Rubaiya | Sign up again with an email that already has an account. | The "email already has an account" sentence. | [ ] |
| **T25** | Sakib | In the Supabase dashboard, open Authentication, Users. | The new people are there. Their profiles have the roles that the codes gave. | [ ] |

### 2.5 Summary of the MVP checklist

When T1 to T25 are ticked, every box in [mvp.md](mvp.md) section 5 can be ticked:

| mvp.md section 5 item | Proven by |
|---|---|
| Worker can log in, report, see status | T1 |
| Manager sees the report within 5 seconds | T2 |
| Manager assigns a free technician; queue when all are busy | T3, T7, T8 |
| Technician can accept, change status, see past jobs | T4, T5, T6 |
| Owner can see everything but cannot change a report | T9 |
| A worker cannot open owner or manager screens, even by typing the address | T10 to T14 |
| Main screens work in Bangla and English | T15 to T17 |
| Owner makes a manager code; a new manager signs up and logs in | T18 to T20 |
| A manager makes worker and technician codes; a new worker signs up on the phone | T21, T22 |
| Sign-up is refused with a wrong, used or expired code, and nobody picks their own role | T20, T23, T24, T14 |

---

## 3. Part 2: the demo script (about 10 minutes)

### 3.1 The set-up on the day

- **Rubaiya** holds the phone, with the screen mirrored or shown to the room. Log in once as **Nila** on the phone beforehand.
- **Mithi** drives the laptop with the website. Open **two windows** side by side: the manager's Dashboard (logged in as Farhan) and, in a private window, the login page.
- **Sakib** keeps the Supabase dashboard open (Table Editor, `reports`) for the "look under the hood" moment, and the terminal ready.
- Run section 1 (the clean start) **the day before** and again **an hour before**.
- Start a **screen recording** of a perfect run in the rehearsal (see section 4).

### 3.2 The story

| Minute | Who speaks | What happens on screen | What to say (in your own words) |
|---|---|---|---|
| 0:00 | Sakib | The login page of the phone and the website | "In a garment factory, when a sewing machine breaks, the line stops. Today the worker has to find a supervisor. GarmentPulse puts the whole chain in one place: worker, manager, technician and owner." |
| 1:00 | Rubaiya | Phone: Nila logs in, the Home screen | "Nila is a worker. She sees only her own screens." |
| 1:30 | Rubaiya | Report: pick **Sewing machine 01**, type "Belt is loose", send | "She picks the machine from a list and writes a short problem. No phone calls." |
| 2:00 | Mithi | **Without refreshing**, the new report appears at the top of the manager's Dashboard | "The manager sees it within 5 seconds, live. It is in the queue because nobody is assigned." |
| 2:45 | Mithi | Press Assign. Tariq is greyed out (busy). Choose **Hasan** | "The system shows who is free and who is busy, so the manager never double-books a technician. The database itself refuses a second job for a busy technician." |
| 3:30 | Rubaiya | Phone, as Hasan (technician): the job appears. Accept, Start work | "Hasan's phone shows his new job. He accepts it and starts. Everyone sees the change in a few seconds." |
| 4:30 | Mithi | The manager's list shows **In progress** | "The manager's screen updated by itself." |
| 5:00 | Rubaiya | Hasan: Mark as fixed. History shows the job | "Done. Hasan is free again, and the job is in his history." |
| 5:45 | Mithi | Owner login. Three boxes, all reports, no Assign button | "The owner can watch everything and change nothing. That is a deliberate rule, enforced by the database." |
| 6:30 | Mithi | Owner makes a **manager code**. Private window: sign up with it as a new manager | "How do new people join? Only with an invite code. The owner makes a manager code. It works once and runs out in a week." |
| 7:30 | Rubaiya | Phone: a manager makes a worker code, a new worker signs up with it | "The code decides the role. Nobody can choose to be a manager." |
| 8:15 | Sakib | Try the **same code again**; try a **manager** code on the phone | "A used code, a made-up code, or the wrong app are all refused, and no account is created." |
| 9:00 | Rubaiya | Press the language button, Bangla | "The whole app works in Bangla and English, because many workers read Bangla." |
| 9:30 | Sakib | The Supabase dashboard: `reports` table, and the result of the 101 + 28 checks | "Behind the screens, the database is the security guard. We tested the rules with 101 database checks and 28 checks that behave like the real apps." |
| 10:00 | All | Final slide / Q&A | "What is next: invoices and receipts, owner approval of big costs, a chatbot, camera presence, several factories." (See [mvp.md](mvp.md) section 3.) |

### 3.3 Good answers to likely questions

| Question | Answer |
|---|---|
| Why a phone app and a website? | Workers and technicians are on the floor with phones. Managers and the owner sit at a computer. Logging into the wrong one is refused. |
| Can a worker see another worker's reports? | No. The database only gives each person their own. We test it. |
| What if two managers assign the same technician at once? | The database allows only one open job per technician, so only one wins. |
| What if someone finds the sign-up page? | Without a good invite code nothing is created. Even calling the backend directly fails. |
| What is not built yet? | See [mvp.md](mvp.md) section 3: invoices, owner approval, chatbot, voice, camera, payments, several factories. |

---

## 4. If something goes wrong in the demo

| Problem | What to do |
|---|---|
| A live update does not arrive | Say "the internet is slow here" and refresh once. If it still fails, show the **backup video** (below). |
| A login fails | Check the caps lock. Use the second account for the same role. |
| A screen is stuck | Close and reopen the app. Each person is already logged in on a second window. |
| The reset was forgotten | Sakib runs `reset_demo_data.sql`, then `seed.sql`, in two minutes. |
| The internet is down | Show the **backup video** and the checks in the terminal. |

**The backup video:** during the rehearsal, record a perfect run of section 3.2 on the phone and the laptop, with sound. Keep the file on **two** devices (not in git). Play it if a live step fails twice.

---

## 5. After every run

1. **Sakib** deletes the leftovers. The real check prints the exact lines. They look like this:

   ```sql
   delete from auth.users where email like 'realcheck-%-<stamp>@example.com';
   delete from public.invite_codes where code in ('...');
   delete from public.reports where description like 'Real client check%';
   ```

2. **Everyone** deletes the pretend people they made by sign-up in section 2.4 (Sakib can do it in the Supabase dashboard, Authentication, Users).
3. **Sakib** runs `supabase/reset_demo_data.sql` and `supabase/seed.sql` again, so the next run starts from the story.
4. **Write down the result** in the table below, and put any problem in a note in `requests/` for the person who owns it.

### The result log

| Date | Who ran it | T-numbers passed | T-numbers failed | Notes |
|---|---|---|---|---|
| 2026-10-20 | Sakib alone (website in the browser pane driven by Claude, phone with Expo Go on Sakib's own phone, real backend) | T1 to T13, T15, T16, T18 to T24 | none | **Nothing failed.** Report story, live updates, queue ("All technicians are busy"), owner view (no Assign), wrong-app and logged-out refusals, invite codes, manager sign-up on the website, worker sign-up on the phone, and every code refusal all worked. **Not run yet:** T14 (real client check), T17 (error sentences in both languages on both apps), T25 (Authentication list check), and a manager typing `/owner`. T2 was seen appearing with no refresh, but the seconds were not timed (the real client check measured 0.5 s). Bangla and English: nothing missing on any page, but the Bangla words are still a draft until a Bangla speaker reads them. The test left pretend accounts (`realcheck-...@example.com`) and changed the data; both were cleaned (reset and seed). |
| | | | | |

---

## 6. Known limits (say them out loud)

- The Bangla words are a draft until a Bangla speaker has read them.
- People's and machines' names show in English letters in Bangla mode (the Bangla names come later).
- Expenses, invoices, owner approval, chatbot, camera presence, voice input, payments and several factories are **not** in this version on purpose.
