  -- =============================================================================
  -- Rules check for the backend (run by hand in the Supabase SQL Editor)
  -- =============================================================================
  -- What this file does, in plain words:
  --   Acts as each test person (Nila the worker, Tariq and Hasan the
  --   technicians, Farhan the manager, Mr. Rahman the owner, plus "nobody")
  --   and tries about 126 things against the real functions and tables. The
  --   last part tests SIGN-UP WITH INVITE CODES: the code functions and the
  --   sign-up guard (it adds pretend new people to the login list, and the
  --   final "error" removes them again).
  --   Allowed actions must WORK. Forbidden actions must FAIL with the exact
  --   error code from docs/api-contract.md. For example:
  --     * a worker cannot assign a technician            -> NOT_ALLOWED
  --     * a busy technician cannot get a second job      -> TECHNICIAN_BUSY
  --     * nobody can write a table directly              -> permission denied
  --
  -- HOW TO RUN
  --   1. The migrations and supabase/seed.sql must already be applied, and the
  --      reports must be exactly the 4 from the seed. Other people's test
  --      reports (a phone or website that was tried out) change the counts and
  --      make the old checks fail for no real reason. To start clean, run
  --      supabase/reset_demo_data.sql and then supabase/seed.sql first. The
  --      same goes for leftover INVITE CODES: a code that someone made by hand
  --      and did not use still shows in the owner's and the managers' lists, so
  --      the reset file deletes all codes too.
  --   2. Supabase dashboard > SQL Editor > New query. Paste this whole file.
  --   3. Click Run.
  --
  -- HOW TO READ THE RESULT
  --   The script ENDS WITH AN "ERROR" ON PURPOSE. That is how it undoes all
  --   its test changes, so your data stays exactly as the seed left it.
  --   The error message is the report: one line per check, "PASS" or "FAIL",
  --   and a headline saying how many passed.
  --
  -- Safe to run as many times as you like. It never keeps any change.
  -- It needs full rights (the dashboard SQL Editor has them) because it
  -- pretends to be other people. Never run it against real factory data.
  --
  -- This is a hand-run check. Automatic database tests (pgTAP) can be added
  -- later once Docker is set up (see supabase/CLAUDE.md).
  -- =============================================================================
  
  do $test$
  declare
    -- The list of checks. Each one has:
    --   email  = who is asking (missing = nobody is logged in)
    --   role   = database role to use (default: authenticated). "anon" = a
    --            visitor who is not logged in. "postgres" = the database owner,
    --            used to add pretend people to the login list.
    --   call   = the SQL to run; it must return one JSON value
    --   error  = the error we EXPECT (missing = it must succeed)
    --   check  = an extra yes/no test on the result, where $1 is the result
    --   save   = remember what was created (an invite code, else an id) under
    --            this name, so later checks can use it as $NAME
    -- Words starting with $ (like $NILA, or $CODE_WRK that an earlier check
    -- saved) are replaced by the real values below.
    v_tests jsonb := $json$[
      {"name":"Nobody logged in cannot list reports","call":"select public.list_reports()","error":"NOT_AUTHENTICATED"},
      {"name":"Anonymous role cannot call functions at all","role":"anon","call":"select public.list_reports()","error":"permission denied for function list_reports"},
  
      {"name":"Worker: get my profile","email":"nila@example.com","call":"select public.get_my_profile()","check":"$1->>'role' = 'worker'"},
      {"name":"Worker: list machines (5)","email":"nila@example.com","call":"select public.list_machines()","check":"jsonb_array_length($1) = 5"},
      {"name":"Worker: list my reports (4)","email":"nila@example.com","call":"select public.list_my_reports()","check":"jsonb_array_length($1) = 4"},
      {"name":"Worker cannot list all reports","email":"nila@example.com","call":"select public.list_reports()","error":"NOT_ALLOWED"},
      {"name":"Worker cannot assign a technician","email":"nila@example.com","call":"select public.assign_technician('$R_THREAD', '$HASAN')","error":"NOT_ALLOWED"},
      {"name":"Worker cannot read the profiles table directly","email":"nila@example.com","call":"select to_jsonb(count(*)) from public.profiles","error":"permission denied for table profiles"},
      {"name":"Worker cannot insert into reports directly","email":"nila@example.com","call":"with x as (insert into public.reports (machine_id, reported_by, description) values ('$M1', '$NILA', 'sneaky') returning 1) select to_jsonb(1)","error":"permission denied for table reports"},
      {"name":"Worker cannot change a report directly","email":"nila@example.com","call":"with x as (update public.reports set status = 'resolved' where id = '$R_THREAD' returning 1) select to_jsonb(1)","error":"permission denied for table reports"},
      {"name":"Worker sees only own reports in the table (4)","email":"nila@example.com","call":"select to_jsonb(count(*)) from public.reports","check":"($1 #>> '{}')::int = 4"},
  
      {"name":"Technician cannot create a report","email":"tariq@example.com","call":"select public.create_report('$M1', 'hello')","error":"NOT_ALLOWED"},
      {"name":"Technician sees only own reports in the table (1)","email":"tariq@example.com","call":"select to_jsonb(count(*)) from public.reports","check":"($1 #>> '{}')::int = 1"},
      {"name":"Technician: my open jobs (Tariq has 1)","email":"tariq@example.com","call":"select public.list_my_jobs()","check":"jsonb_array_length($1) = 1"},
      {"name":"Technician: with past jobs (Tariq still 1)","email":"tariq@example.com","call":"select public.list_my_jobs(true)","check":"jsonb_array_length($1) = 1"},
      {"name":"Technician: Hasan has no open jobs","email":"hasan@example.com","call":"select public.list_my_jobs()","check":"jsonb_array_length($1) = 0"},
      {"name":"Technician: Hasan has 1 past job","email":"hasan@example.com","call":"select public.list_my_jobs(true)","check":"jsonb_array_length($1) = 1"},
      {"name":"Technician cannot open a QUEUED report (nobody assigned yet)","email":"hasan@example.com","call":"select public.get_report('$R_MOTOR')","error":"NOT_FOUND"},
      {"name":"Another technician cannot open a QUEUED report either","email":"tariq@example.com","call":"select public.get_report('$R_MOTOR')","error":"NOT_FOUND"},
      {"name":"The manager can open a queued report","email":"farhan@example.com","call":"select public.get_report('$R_MOTOR')","check":"$1->>'status' = 'waiting' and $1->'technician' = 'null'::jsonb"},
  
      {"name":"Manager: list all reports (4)","email":"farhan@example.com","call":"select public.list_reports()","check":"jsonb_array_length($1) = 4"},
      {"name":"Manager: filter resolved (1)","email":"farhan@example.com","call":"select public.list_reports('resolved')","check":"jsonb_array_length($1) = 1"},
      {"name":"Manager: wrong status word is rejected","email":"farhan@example.com","call":"select public.list_reports('nonsense')","error":"INVALID_INPUT"},
      {"name":"Manager: Tariq is busy and Hasan is free","email":"farhan@example.com","call":"select public.list_technicians()","check":"exists (select 1 from jsonb_array_elements($1) e where e->>'display_name' = 'Tariq Hasan' and e->>'availability' = 'busy') and exists (select 1 from jsonb_array_elements($1) e where e->>'display_name' = 'Hasan Ali' and e->>'availability' = 'free')"},
      {"name":"Manager cannot assign a busy technician","email":"farhan@example.com","call":"select public.assign_technician('$R_THREAD', '$TARIQ')","error":"TECHNICIAN_BUSY"},
      {"name":"Manager cannot assign a non-technician","email":"farhan@example.com","call":"select public.assign_technician('$R_THREAD', '$NILA')","error":"NOT_FOUND"},
      {"name":"Manager cannot assign on a resolved report","email":"farhan@example.com","call":"select public.assign_technician('$R_PRESS', '$HASAN')","error":"INVALID_STATUS_CHANGE"},
      {"name":"Manager assigns the free technician (Hasan)","email":"farhan@example.com","call":"select public.assign_technician('$R_THREAD', '$HASAN')","check":"$1->'technician'->>'display_name' = 'Hasan Ali' and $1->>'status' = 'waiting'"},
      {"name":"Manager cannot assign the same report twice","email":"farhan@example.com","call":"select public.assign_technician('$R_THREAD', '$HASAN')","error":"REPORT_ALREADY_ASSIGNED"},
      {"name":"Manager cannot give Hasan a second job (now busy)","email":"farhan@example.com","call":"select public.assign_technician('$R_MOTOR', '$HASAN')","error":"TECHNICIAN_BUSY"},
      {"name":"Manager cannot see the owner summary","email":"farhan@example.com","call":"select public.get_owner_summary()","error":"NOT_ALLOWED"},
  
      {"name":"Technician cannot accept someone else's job","email":"tariq@example.com","call":"select public.accept_job('$R_THREAD')","error":"NOT_ALLOWED"},
      {"name":"Technician cannot open someone else's report","email":"tariq@example.com","call":"select public.get_report('$R_THREAD')","error":"NOT_FOUND"},
      {"name":"Cannot change status before accepting","email":"hasan@example.com","call":"select public.update_job_status('$R_THREAD', 'in_progress')","error":"JOB_NOT_ACCEPTED"},
      {"name":"Technician accepts the job (status stays waiting)","email":"hasan@example.com","call":"select public.accept_job('$R_THREAD')","check":"$1->>'status' = 'waiting' and $1->>'accepted_at' is not null"},
      {"name":"Cannot accept the same job twice","email":"hasan@example.com","call":"select public.accept_job('$R_THREAD')","error":"JOB_ALREADY_ACCEPTED"},
      {"name":"Status word 'waiting' is rejected as an input","email":"hasan@example.com","call":"select public.update_job_status('$R_THREAD', 'waiting')","error":"INVALID_INPUT"},
      {"name":"Technician starts work (in_progress)","email":"hasan@example.com","call":"select public.update_job_status('$R_THREAD', 'in_progress')","check":"$1->>'status' = 'in_progress'"},
      {"name":"Cannot repeat the same status","email":"hasan@example.com","call":"select public.update_job_status('$R_THREAD', 'in_progress')","error":"INVALID_STATUS_CHANGE"},
      {"name":"Technician finishes the job (resolved)","email":"hasan@example.com","call":"select public.update_job_status('$R_THREAD', 'resolved')","check":"$1->>'status' = 'resolved'"},
      {"name":"Resolved is final: cannot go back","email":"hasan@example.com","call":"select public.update_job_status('$R_THREAD', 'in_progress')","error":"INVALID_STATUS_CHANGE"},
  
      {"name":"Worker creates a report (waiting, in the queue)","email":"nila@example.com","call":"select public.create_report('$M1', 'Belt is loose.')","save":"NEWR","check":"$1->>'status' = 'waiting' and $1->'technician' = 'null'::jsonb"},
      {"name":"Empty description is rejected","email":"nila@example.com","call":"select public.create_report('$M1', '   ')","error":"INVALID_INPUT"},
      {"name":"Unknown machine is rejected","email":"nila@example.com","call":"select public.create_report('not-an-id', 'Belt is loose.')","error":"NOT_FOUND"},
      {"name":"Worker can open own new report","email":"nila@example.com","call":"select public.get_report('$NEWR')","check":"$1->>'description' = 'Belt is loose.'"},
  
      {"name":"Owner: list all reports (5)","email":"owner@example.com","call":"select public.list_reports()","check":"jsonb_array_length($1) = 5"},
      {"name":"Owner: summary counts (2 waiting, 1 in progress, 2 resolved)","email":"owner@example.com","call":"select public.get_owner_summary()","check":"$1->>'waiting' = '2' and $1->>'in_progress' = '1' and $1->>'resolved' = '2'"},
      {"name":"Owner cannot assign (read-only)","email":"owner@example.com","call":"select public.assign_technician('$R_MOTOR', '$HASAN')","error":"NOT_ALLOWED"},
      {"name":"Owner sees all reports in the table (5)","email":"owner@example.com","call":"select to_jsonb(count(*)) from public.reports","check":"($1 #>> '{}')::int = 5"},
  
      {"name":"INVITE: owner makes a manager code (10 safe characters)","email":"owner@example.com","call":"select public.create_invite_code('manager')","save":"CODE_MGR","check":"$1->>'role' = 'manager' and $1->>'code' ~ '^[A-HJ-NP-Z2-9]{10}$'"},
      {"name":"INVITE: owner cannot make a worker code","email":"owner@example.com","call":"select public.create_invite_code('worker')","error":"NOT_ALLOWED"},
      {"name":"INVITE: nobody can make an OWNER code","email":"owner@example.com","call":"select public.create_invite_code('owner')","error":"INVALID_INPUT"},
      {"name":"INVITE: a made-up role is rejected","email":"owner@example.com","call":"select public.create_invite_code('boss')","error":"INVALID_INPUT"},
      {"name":"INVITE: a missing role is rejected","email":"owner@example.com","call":"select public.create_invite_code(null)","error":"INVALID_INPUT"},
      {"name":"INVITE: manager makes a worker code","email":"farhan@example.com","call":"select public.create_invite_code('worker')","save":"CODE_WRK","check":"$1->>'role' = 'worker'"},
      {"name":"INVITE: manager makes a technician code","email":"farhan@example.com","call":"select public.create_invite_code('technician')","save":"CODE_TECH","check":"$1->>'role' = 'technician'"},
      {"name":"INVITE: manager makes a second worker code","email":"farhan@example.com","call":"select public.create_invite_code('worker')","save":"CODE_WRK2","check":"$1->>'role' = 'worker'"},
      {"name":"INVITE: manager makes a third worker code","email":"farhan@example.com","call":"select public.create_invite_code('worker')","save":"CODE_WRK3","check":"$1->>'role' = 'worker'"},
      {"name":"INVITE: manager cannot make a manager code","email":"farhan@example.com","call":"select public.create_invite_code('manager')","error":"NOT_ALLOWED"},
      {"name":"INVITE: worker cannot make a code","email":"nila@example.com","call":"select public.create_invite_code('worker')","error":"NOT_ALLOWED"},
      {"name":"INVITE: technician cannot make a code","email":"tariq@example.com","call":"select public.create_invite_code('worker')","error":"NOT_ALLOWED"},
      {"name":"INVITE: a logged-out visitor cannot make a code","role":"anon","call":"select public.create_invite_code('worker')","error":"permission denied for function create_invite_code"},
      {"name":"INVITE: a login with no person behind it cannot make a code","call":"select public.create_invite_code('worker')","error":"NOT_AUTHENTICATED"},
      {"name":"INVITE: manager lists only own unused codes (4)","email":"farhan@example.com","call":"select public.list_invite_codes()","check":"jsonb_array_length($1) = 4 and exists (select 1 from jsonb_array_elements($1) e where e->>'code' = '$CODE_WRK') and not exists (select 1 from jsonb_array_elements($1) e where e->>'code' = '$CODE_MGR')"},
      {"name":"INVITE: owner lists only the manager code (1)","email":"owner@example.com","call":"select public.list_invite_codes()","check":"jsonb_array_length($1) = 1 and $1->0->>'code' = '$CODE_MGR'"},
      {"name":"INVITE: worker cannot list codes","email":"nila@example.com","call":"select public.list_invite_codes()","error":"NOT_ALLOWED"},
      {"name":"INVITE: a visitor can check a good code before sign-up","role":"anon","call":"select public.check_invite_code('$CODE_WRK')","check":"$1->>'role' = 'worker'"},
      {"name":"INVITE: checking works with small letters and spaces","role":"anon","call":"select public.check_invite_code(' ' || lower('$CODE_WRK') || ' ')","check":"$1->>'role' = 'worker'"},
      {"name":"INVITE: a too-short code is invalid","role":"anon","call":"select public.check_invite_code('ABC')","error":"INVALID_CODE"},
      {"name":"INVITE: an empty code is invalid","role":"anon","call":"select public.check_invite_code('')","error":"INVALID_CODE"},
      {"name":"INVITE: a missing code is invalid","role":"anon","call":"select public.check_invite_code(null)","error":"INVALID_CODE"},
      {"name":"INVITE: a code that was never made is invalid","role":"anon","call":"select public.check_invite_code('ABCDEFGHJK')","error":"INVALID_CODE"},
      {"name":"INVITE: a code with a look-alike letter (O) is invalid","role":"anon","call":"select public.check_invite_code('OOOOOOOOOO')","error":"INVALID_CODE"},
      {"name":"INVITE: nobody can read the codes table directly","email":"nila@example.com","call":"select to_jsonb(count(*)) from public.invite_codes","error":"permission denied for table invite_codes"},
      {"name":"INVITE: nobody can read the approved accounts table directly","email":"farhan@example.com","call":"select to_jsonb(count(*)) from public.approved_accounts","error":"permission denied for table approved_accounts"},
  
      {"name":"GUARD: sign-up with no code is refused","role":"postgres","call":"with x as (insert into auth.users (id, email, raw_user_meta_data) values (gen_random_uuid(), 'stranger@example.com', '{}'::jsonb) returning id) select to_jsonb(1)","error":"INVALID_CODE"},
      {"name":"GUARD: sign-up with a wrong code is refused","role":"postgres","call":"with x as (insert into auth.users (id, email, raw_user_meta_data) values (gen_random_uuid(), 'stranger@example.com', jsonb_build_object('invite_code', 'ABCDEFGHJK', 'display_name', 'Stranger')) returning id) select to_jsonb(1)","error":"INVALID_CODE"},
      {"name":"GUARD: sign-up with a garbage code is refused","role":"postgres","call":"with x as (insert into auth.users (id, email, raw_user_meta_data) values (gen_random_uuid(), 'stranger@example.com', jsonb_build_object('invite_code', 'hello', 'display_name', 'Stranger')) returning id) select to_jsonb(1)","error":"INVALID_CODE"},
      {"name":"GUARD: choosing the manager role yourself does not work (no code)","role":"postgres","call":"with x as (insert into auth.users (id, email, raw_user_meta_data) values (gen_random_uuid(), 'sneaky@example.com', jsonb_build_object('role', 'manager', 'display_name', 'Sneaky')) returning id) select to_jsonb(1)","error":"INVALID_CODE"},
      {"name":"GUARD: a good code but no name is refused","role":"postgres","call":"with x as (insert into auth.users (id, email, raw_user_meta_data) values (gen_random_uuid(), 'noname@example.com', jsonb_build_object('invite_code', '$CODE_WRK3')) returning id) select to_jsonb(1)","error":"INVALID_INPUT"},
      {"name":"GUARD: a good code but a 81-letter name is refused","role":"postgres","call":"with x as (insert into auth.users (id, email, raw_user_meta_data) values (gen_random_uuid(), 'longname@example.com', jsonb_build_object('invite_code', '$CODE_WRK3', 'display_name', repeat('x', 81))) returning id) select to_jsonb(1)","error":"INVALID_INPUT"},
      {"name":"GUARD: a refused sign-up leaves the code unused","email":"farhan@example.com","call":"select public.list_invite_codes()","check":"jsonb_array_length($1) = 4"},
      {"name":"GUARD: a good worker code signs a worker up (the role field is ignored)","role":"postgres","call":"with x as (insert into auth.users (id, email, raw_user_meta_data) values (gen_random_uuid(), 'newworker@example.com', jsonb_build_object('invite_code', '$CODE_WRK', 'display_name', 'New Worker', 'role', 'manager')) returning id) select to_jsonb(1)"},
      {"name":"GUARD: the new profile is a worker with the typed name","role":"postgres","call":"select to_jsonb(p) from public.profiles p where p.email = 'newworker@example.com'","check":"$1->>'role' = 'worker' and $1->>'display_name' = 'New Worker'"},
      {"name":"GUARD: the code is now marked as used","role":"postgres","call":"select to_jsonb(c) from public.invite_codes c where c.code = '$CODE_WRK'","check":"$1->>'used_at' is not null and $1->>'used_by' is not null"},
      {"name":"GUARD: a used code cannot be used again","role":"postgres","call":"with x as (insert into auth.users (id, email, raw_user_meta_data) values (gen_random_uuid(), 'second@example.com', jsonb_build_object('invite_code', '$CODE_WRK', 'display_name', 'Second')) returning id) select to_jsonb(1)","error":"INVALID_CODE"},
      {"name":"GUARD: a used code is no longer valid to check","role":"anon","call":"select public.check_invite_code('$CODE_WRK')","error":"INVALID_CODE"},
      {"name":"GUARD: a technician code signs a technician up (the owner role field is ignored)","role":"postgres","call":"with x as (insert into auth.users (id, email, raw_user_meta_data) values (gen_random_uuid(), 'newtech@example.com', jsonb_build_object('invite_code', '$CODE_TECH', 'display_name', 'New Tech', 'role', 'owner')) returning id) select to_jsonb(1)"},
      {"name":"GUARD: the new profile is a technician, not an owner","role":"postgres","call":"select to_jsonb(p) from public.profiles p where p.email = 'newtech@example.com'","check":"$1->>'role' = 'technician'"},
      {"name":"GUARD: the code works typed in small letters","role":"postgres","call":"with x as (insert into auth.users (id, email, raw_user_meta_data) values (gen_random_uuid(), 'lowerworker@example.com', jsonb_build_object('invite_code', lower('$CODE_WRK2'), 'display_name', 'Lower Worker')) returning id) select to_jsonb(1)"},
      {"name":"GUARD: the new worker can use the app (profile and own reports)","email":"newworker@example.com","call":"select public.get_my_profile()","check":"$1->>'role' = 'worker'"},
      {"name":"GUARD: the new worker starts with no reports","email":"newworker@example.com","call":"select public.list_my_reports()","check":"jsonb_array_length($1) = 0"},
      {"name":"GUARD: the new worker still cannot do a manager's job","email":"newworker@example.com","call":"select public.list_reports()","error":"NOT_ALLOWED"},
      {"name":"GUARD: the new technician cannot make codes","email":"newtech@example.com","call":"select public.create_invite_code('worker')","error":"NOT_ALLOWED"},
      {"name":"GUARD: the manager now lists only the unused code (1)","email":"farhan@example.com","call":"select public.list_invite_codes()","check":"jsonb_array_length($1) = 1 and $1->0->>'code' = '$CODE_WRK3'"},
      {"name":"GUARD: set up an expired code","role":"postgres","call":"with x as (insert into public.invite_codes (code, role, created_by, expires_at) values ('MNPQRSTUVW', 'worker', '$FARHAN', now() - interval '1 day') returning id) select to_jsonb(1)"},
      {"name":"GUARD: an expired code is not valid to check","role":"anon","call":"select public.check_invite_code('MNPQRSTUVW')","error":"INVALID_CODE"},
      {"name":"GUARD: an expired code cannot sign anyone up","role":"postgres","call":"with x as (insert into auth.users (id, email, raw_user_meta_data) values (gen_random_uuid(), 'late@example.com', jsonb_build_object('invite_code', 'MNPQRSTUVW', 'display_name', 'Late')) returning id) select to_jsonb(1)","error":"INVALID_CODE"},
      {"name":"GUARD: set up a pre-approved owner email","role":"postgres","call":"with x as (insert into public.approved_accounts (email, role, display_name) values ('newowner@example.com', 'owner', 'New Owner') returning email) select to_jsonb(1)"},
      {"name":"GUARD: a pre-approved email gets in without a code (the typed name is ignored)","role":"postgres","call":"with x as (insert into auth.users (id, email, raw_user_meta_data) values (gen_random_uuid(), 'newowner@example.com', jsonb_build_object('display_name', 'Fake Name')) returning id) select to_jsonb(1)"},
      {"name":"GUARD: the pre-approved profile has the role and name from Sakib's list","role":"postgres","call":"select to_jsonb(p) from public.profiles p where p.email = 'newowner@example.com'","check":"$1->>'role' = 'owner' and $1->>'display_name' = 'New Owner'"},
  
      {"name": "BANGLA: a profile has the display_name_bn field, empty (null)", "email": "nila@example.com", "call": "select public.get_my_profile()", "check": "$1->'display_name_bn' = 'null'::jsonb"},
      {"name": "BANGLA: the machine list has name_bn, all empty (null)", "email": "nila@example.com", "call": "select public.list_machines()", "check": "jsonb_array_length($1) = 5 and not exists (select 1 from jsonb_array_elements($1) e where e->'name_bn' is distinct from 'null'::jsonb)"},
      {"name": "BANGLA: every report has the Bangla fields, all empty (null)", "email": "farhan@example.com", "call": "select public.list_reports()", "check": "jsonb_array_length($1) = 5 and not exists (select 1 from jsonb_array_elements($1) e where e->'machine'->'name_bn' is distinct from 'null'::jsonb or e->'reported_by'->'display_name_bn' is distinct from 'null'::jsonb)"},
      {"name": "BANGLA: the technician list has display_name_bn, all empty (null)", "email": "farhan@example.com", "call": "select public.list_technicians()", "check": "not exists (select 1 from jsonb_array_elements($1) e where e->'display_name_bn' is distinct from 'null'::jsonb)"},
      {"name": "BANGLA: set up a Bangla machine name", "role": "postgres", "call": "with x as (update public.machines set name_bn = 'সেলাই মেশিন ১৪' where name = 'Sewing machine 14' returning 1) select to_jsonb(1)"},
      {"name": "BANGLA: set up Bangla names for Tariq and Nila", "role": "postgres", "call": "with x as (update public.profiles set display_name_bn = case email when 'tariq@example.com' then 'তারিক হাসান' else 'নীলা আক্তার' end where email in ('tariq@example.com', 'nila@example.com') returning 1) select to_jsonb(1)"},
      {"name": "BANGLA: the worker sees her own Bangla name", "email": "nila@example.com", "call": "select public.get_my_profile()", "check": "$1->>'display_name_bn' = 'নীলা আক্তার'"},
      {"name": "BANGLA: the machine list shows the Bangla machine name", "email": "nila@example.com", "call": "select public.list_machines()", "check": "exists (select 1 from jsonb_array_elements($1) e where e->>'name' = 'Sewing machine 14' and e->>'name_bn' = 'সেলাই মেশিন ১৪')"},
      {"name": "BANGLA: a report shows the Bangla names of the machine, the worker and the technician", "email": "farhan@example.com", "call": "select public.list_reports()", "check": "exists (select 1 from jsonb_array_elements($1) e where e->>'description' = 'The needle keeps breaking.' and e->'machine'->>'name_bn' = 'সেলাই মেশিন ১৪' and e->'reported_by'->>'display_name_bn' = 'নীলা আক্তার' and e->'technician'->>'display_name_bn' = 'তারিক হাসান')"},
      {"name": "BANGLA: the technician list shows the Bangla name", "email": "farhan@example.com", "call": "select public.list_technicians()", "check": "exists (select 1 from jsonb_array_elements($1) e where e->>'display_name' = 'Tariq Hasan' and e->>'display_name_bn' = 'তারিক হাসান')"},
      {"name": "BANGLA: the technician sees the worker's Bangla name on his job", "email": "tariq@example.com", "call": "select public.list_my_jobs()", "check": "$1->0->'reported_by'->>'display_name_bn' = 'নীলা আক্তার'"},
      {"name": "BANGLA: the owner sees the Bangla names in the same reports", "email": "owner@example.com", "call": "select public.list_reports()", "check": "exists (select 1 from jsonb_array_elements($1) e where e->'technician'->>'display_name_bn' = 'তারিক হাসান')"},
      {"name": "BANGLA: a Bangla name longer than 80 letters is refused", "role": "postgres", "call": "with x as (update public.profiles set display_name_bn = repeat('ক', 81) where email = 'nila@example.com' returning 1) select to_jsonb(1)", "error": "new row for relation"},
      {"name": "BANGLA: a Bangla name of only spaces is refused", "role": "postgres", "call": "with x as (update public.profiles set display_name_bn = '   ' where email = 'nila@example.com' returning 1) select to_jsonb(1)", "error": "new row for relation"},
      {"name": "BANGLA: a machine's Bangla name longer than 80 letters is refused", "role": "postgres", "call": "with x as (update public.machines set name_bn = repeat('ক', 81) where name = 'Sewing machine 01' returning 1) select to_jsonb(1)", "error": "new row for relation"},
      {"name": "BANGLA GUARD: a sign-up with an 81-letter Bangla name is refused", "role": "postgres", "call": "with x as (insert into auth.users (id, email, raw_user_meta_data) values (gen_random_uuid(), 'bnlong@example.com', jsonb_build_object('invite_code', '$CODE_WRK3', 'display_name', 'Bangla Long', 'display_name_bn', repeat('ক', 81))) returning id) select to_jsonb(1)", "error": "INVALID_INPUT"},
      {"name": "BANGLA GUARD: a sign-up with a good Bangla name works", "role": "postgres", "call": "with x as (insert into auth.users (id, email, raw_user_meta_data) values (gen_random_uuid(), 'bnworker@example.com', jsonb_build_object('invite_code', '$CODE_WRK3', 'display_name', 'Bangla Worker', 'display_name_bn', '  বাংলা কর্মী ')) returning id) select to_jsonb(1)"},
      {"name": "BANGLA GUARD: the new profile saved the Bangla name (trimmed) and the English name", "role": "postgres", "call": "select to_jsonb(p) from public.profiles p where p.email = 'bnworker@example.com'", "check": "$1->>'display_name_bn' = 'বাংলা কর্মী' and $1->>'display_name' = 'Bangla Worker'"},
      {"name": "BANGLA GUARD: the new worker sees the Bangla name in her profile", "email": "bnworker@example.com", "call": "select public.get_my_profile()", "check": "$1->>'display_name_bn' = 'বাংলা কর্মী'"},
      {"name": "BANGLA GUARD: set up one more worker code", "email": "farhan@example.com", "call": "select public.create_invite_code('worker')", "check": "$1->>'role' = 'worker'", "save": "CODE_WRK4"},
      {"name": "BANGLA GUARD: a sign-up with a blank Bangla name works", "role": "postgres", "call": "with x as (insert into auth.users (id, email, raw_user_meta_data) values (gen_random_uuid(), 'bnblank@example.com', jsonb_build_object('invite_code', '$CODE_WRK4', 'display_name', 'Blank Bangla', 'display_name_bn', '   ')) returning id) select to_jsonb(1)"},
      {"name": "BANGLA GUARD: a blank Bangla name saves nothing (null)", "role": "postgres", "call": "select to_jsonb(p) from public.profiles p where p.email = 'bnblank@example.com'", "check": "$1->'display_name_bn' = 'null'::jsonb"},
      {"name": "BANGLA GUARD: set up a pre-approved account with a Bangla name", "role": "postgres", "call": "with x as (insert into public.approved_accounts (email, role, display_name, display_name_bn) values ('bnowner@example.com', 'owner', 'Bangla Owner', 'বাংলা মালিক') returning email) select to_jsonb(1)"},
      {"name": "BANGLA GUARD: a pre-approved account gets the Bangla name from Sakib's list, not from the form", "role": "postgres", "call": "with x as (insert into auth.users (id, email, raw_user_meta_data) values (gen_random_uuid(), 'bnowner@example.com', jsonb_build_object('display_name_bn', 'typed by the person')) returning id) select to_jsonb(1)"},
      {"name": "BANGLA GUARD: the pre-approved profile has the Bangla name from the list", "role": "postgres", "call": "select to_jsonb(p) from public.profiles p where p.email = 'bnowner@example.com'", "check": "$1->>'display_name_bn' = 'বাংলা মালিক' and $1->>'role' = 'owner'"}
    ]$json$;
  
    t         jsonb;
    v_n       int := 0;
    v_failed  int := 0;
    v_lines   text := '';
    v_call    text;
    v_sub     uuid;
    v_result  jsonb;
    v_err     text;
    v_expect  text;
    v_ok      boolean;
    v_detail  text;
  
    v_nila uuid; v_tariq uuid; v_hasan uuid; v_farhan uuid; v_owner uuid;
    v_r_needle uuid; v_r_thread uuid; v_r_motor uuid; v_r_press uuid;
    v_m1 uuid;
  
    -- Values remembered between checks (a "save" in a check puts one here), and
    -- the tools to put them back into later checks.
    v_vars  jsonb := '{}'::jsonb;
    v_key   text;
    v_check text;
  begin
    -- Look up the ids from the seed data.
    select id into v_nila   from public.profiles where email = 'nila@example.com';
    select id into v_tariq  from public.profiles where email = 'tariq@example.com';
    select id into v_hasan  from public.profiles where email = 'hasan@example.com';
    select id into v_farhan from public.profiles where email = 'farhan@example.com';
    select id into v_owner  from public.profiles where email = 'owner@example.com';
    select id into v_r_needle from public.reports where description = 'The needle keeps breaking.';
    select id into v_r_thread from public.reports where description = 'Thread tension is too tight.';
    select id into v_r_motor  from public.reports where description = 'Strange noise from the motor.';
    select id into v_r_press  from public.reports where description = 'The press does not heat up.';
    select id into v_m1 from public.machines where name = 'Sewing machine 01';
  
    if v_nila is null or v_tariq is null or v_hasan is null or v_farhan is null
       or v_owner is null or v_r_needle is null or v_r_thread is null
       or v_r_motor is null or v_r_press is null or v_m1 is null then
      raise exception 'Seed data is missing or changed. Run supabase/seed.sql on a fresh seed first.';
    end if;
  
    for t in select value from jsonb_array_elements(v_tests) loop
      v_n := v_n + 1;
      v_expect := t ->> 'error';
      v_result := null;
      v_err := null;
  
      -- Fill in the real ids.
      v_call := t ->> 'call';
      v_call := replace(v_call, '$NILA', v_nila::text);
      v_call := replace(v_call, '$TARIQ', v_tariq::text);
      v_call := replace(v_call, '$HASAN', v_hasan::text);
      v_call := replace(v_call, '$FARHAN', v_farhan::text);
      v_call := replace(v_call, '$OWNER', v_owner::text);
      v_call := replace(v_call, '$R_NEEDLE', v_r_needle::text);
      v_call := replace(v_call, '$R_THREAD', v_r_thread::text);
      v_call := replace(v_call, '$R_MOTOR', v_r_motor::text);
      v_call := replace(v_call, '$R_PRESS', v_r_press::text);
      v_call := replace(v_call, '$M1', v_m1::text);
  
      -- Fill in the values remembered by earlier checks (for example $NEWR, the
      -- id of the report just made, or $CODE_WRK, an invite code). Longest names
      -- first, so $CODE_WRK2 is never mistaken for $CODE_WRK.
      v_check := t ->> 'check';
      for v_key in
        select k from jsonb_object_keys(v_vars) as k order by length(k) desc
      loop
        v_call := replace(v_call, '$' || v_key, v_vars ->> v_key);
        v_check := replace(v_check, '$' || v_key, v_vars ->> v_key);
      end loop;
  
      select id into v_sub from auth.users where email = t ->> 'email';
  
      -- Act as that person, run the call, and catch any error.
      begin
        perform set_config(
          'request.jwt.claims',
          case when v_sub is null
               then '{"role":"authenticated"}'
               else jsonb_build_object('sub', v_sub, 'role', 'authenticated')::text
          end,
          true);
        execute format('set local role %I', coalesce(t ->> 'role', 'authenticated'));
        execute v_call into v_result;
      exception when others then
        v_err := sqlerrm;
        v_result := null;
      end;
      execute 'reset role';
  
      -- Remember what was just created: an invite code, or else an id.
      if (t ->> 'save') is not null and v_result is not null then
        v_vars := v_vars || jsonb_build_object(
          t ->> 'save',
          coalesce(v_result ->> 'code', v_result ->> 'id')
        );
      end if;
  
      -- Decide: pass or fail?
      v_ok := false;
      v_detail := '';
      if v_expect is not null then
        if v_err is null then
          v_detail := 'expected error ' || v_expect || ' but it worked';
        elsif left(v_err, length(v_expect)) = v_expect then
          v_ok := true;
        else
          v_detail := 'expected ' || v_expect || ' but got ' || v_err;
        end if;
      else
        if v_err is not null then
          v_detail := 'unexpected error: ' || v_err;
        elsif v_check is not null then
          begin
            execute 'select (' || v_check || ')' into v_ok using v_result;
            v_ok := coalesce(v_ok, false);
            if not v_ok then
              v_detail := 'the result was not what we expected: ' || left(v_result::text, 200);
            end if;
          exception when others then
            v_ok := false;
            v_detail := 'the check itself failed: ' || sqlerrm;
          end;
        else
          v_ok := true;
        end if;
      end if;
  
      if not v_ok then
        v_failed := v_failed + 1;
      end if;
      v_lines := v_lines || E'\n' || case when v_ok then 'PASS ' else 'FAIL ' end
                 || lpad(v_n::text, 3, '0') || '  ' || (t ->> 'name')
                 || case when v_ok then '' else '   <-- ' || v_detail end;
    end loop;
  
    -- Raising an error undoes every test change. The message is the report.
    raise exception E'\n=== RULES CHECK: % ===\n(This "error" is on purpose. It undoes all test changes. Your data is untouched.)\n%',
      case when v_failed = 0
           then 'ALL ' || v_n || ' CHECKS PASSED'
           else v_failed || ' OF ' || v_n || ' CHECKS FAILED' end,
      v_lines;
  end;
  $test$;
