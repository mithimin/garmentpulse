-- =============================================================================
-- Rules check for the backend (run by hand in the Supabase SQL Editor)
-- =============================================================================
-- What this file does, in plain words:
--   Acts as each test person (Nila the worker, Tariq and Hasan the
--   technicians, Farhan the manager, Mr. Rahman the owner, plus "nobody")
--   and tries about 46 things against the real functions and tables.
--   Allowed actions must WORK. Forbidden actions must FAIL with the exact
--   error code from docs/api-contract.md. For example:
--     * a worker cannot assign a technician            -> NOT_ALLOWED
--     * a busy technician cannot get a second job      -> TECHNICIAN_BUSY
--     * nobody can write a table directly              -> permission denied
--
-- HOW TO RUN
--   1. The migrations and supabase/seed.sql must already be applied.
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
  --   role   = database role to use (default: authenticated)
  --   call   = the SQL to run; it must return one JSON value
  --   error  = the error we EXPECT (missing = it must succeed)
  --   check  = an extra yes/no test on the result, where $1 is the result
  --   save   = remember the new report's id for later checks
  -- Words starting with $ (like $NILA) are replaced by the real ids below.
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
    {"name":"Owner sees all reports in the table (5)","email":"owner@example.com","call":"select to_jsonb(count(*)) from public.reports","check":"($1 #>> '{}')::int = 5"}
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
  v_newr uuid;
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
    v_call := replace(v_call, '$NEWR', coalesce(v_newr::text, 'missing'));

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

    -- Remember the id of the report that was just created.
    if t ->> 'save' = 'NEWR' and v_result is not null then
      v_newr := (v_result ->> 'id')::uuid;
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
      elsif (t ->> 'check') is not null then
        begin
          execute 'select (' || (t ->> 'check') || ')' into v_ok using v_result;
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
               || lpad(v_n::text, 2, '0') || '  ' || (t ->> 'name')
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
