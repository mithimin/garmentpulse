-- =============================================================================
-- Migration 8: the invite code functions (step A2 of sign-up with invite codes)
-- =============================================================================
-- What this file does, in plain words:
--   Adds the three functions the apps use for invite codes. They match
--   docs/api-contract.md section 4.7 exactly (same names, inputs, results and
--   error codes):
--
--     create_invite_code(role)   owner (manager codes), manager (worker and
--                                technician codes). Makes a new code.
--     list_invite_codes()        owner, manager. Shows the caller's own codes
--                                that are not used and not expired.
--     check_invite_code(code)    anyone, EVEN BEFORE LOGIN. Says whether a code
--                                is good, and which role it gives.
--
--   Plus one private helper that makes a random code.
--
-- Why "security definer": the table invite_codes is locked for everybody.
-- These functions run with extra rights, but they check the person's role
-- themselves before they read or write anything.
--
-- What this file does NOT do:
--   It does not create accounts. The sign-up guard (step A3) does that part.
--
-- Rules for this folder (see supabase/CLAUDE.md):
--   * Never edit an old migration. Add a NEW file for every change.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Private helper: make one random code
-- -----------------------------------------------------------------------------
-- 10 characters from a list of 32 that has NO look-alikes (no I, O, 0 or 1).
-- That is exactly the shape the table accepts (see migration 7).
-- The randomness comes from random UUIDs. We skip two bytes of the first UUID
-- (positions 6 and 8) because a UUID keeps a few fixed bits there, which would
-- make some letters more likely than others.
create function public.generate_invite_code()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- 32 characters
  v_a        bytea := uuid_send(gen_random_uuid());
  v_b        bytea := uuid_send(gen_random_uuid());
  v_positions constant int[] := array[0, 1, 2, 3, 4, 5, 7];
  v_code     text := '';
  v_i        int;
begin
  -- 7 characters from the first UUID ...
  foreach v_i in array v_positions loop
    v_code := v_code || substr(v_alphabet, (get_byte(v_a, v_i) % 32) + 1, 1);
  end loop;
  -- ... and 3 from the second.
  for v_i in 0..2 loop
    v_code := v_code || substr(v_alphabet, (get_byte(v_b, v_i) % 32) + 1, 1);
  end loop;
  return v_code;
end;
$$;

-- Private: only other functions (running as the database owner) may call it.
revoke all on function public.generate_invite_code() from public, anon, authenticated;


-- -----------------------------------------------------------------------------
-- create_invite_code(role) -- owner (manager codes), manager (worker/technician)
-- -----------------------------------------------------------------------------
-- The owner may make `manager` codes only.
-- A manager may make `worker` and `technician` codes only.
-- Anybody else gets NOT_ALLOWED. A role that is not one of the three gives
-- INVALID_INPUT. The code works once and expires after 7 days (table defaults).
create function public.create_invite_code(role text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller public.user_role;
  v_wanted text;
  v_row    public.invite_codes;
  v_try    int := 0;
begin
  -- Only an owner or a manager may make codes at all.
  v_caller := public.require_role(array['owner', 'manager']::public.user_role[]);

  v_wanted := lower(trim(coalesce(create_invite_code.role, '')));
  if v_wanted not in ('manager', 'worker', 'technician') then
    raise exception 'INVALID_INPUT';
  end if;

  -- Which kind of code may THIS person make?
  if not (
    (v_caller = 'owner'   and v_wanted = 'manager')
    or (v_caller = 'manager' and v_wanted in ('worker', 'technician'))
  ) then
    raise exception 'NOT_ALLOWED';
  end if;

  -- Insert the code. In the very unlikely case that the random code already
  -- exists, try again (up to 5 times).
  loop
    v_try := v_try + 1;
    begin
      insert into public.invite_codes (code, role, created_by)
      values (public.generate_invite_code(), v_wanted::public.user_role, (select auth.uid()))
      returning * into v_row;
      exit;
    exception when unique_violation then
      if v_try >= 5 then
        raise;
      end if;
    end;
  end loop;

  return jsonb_build_object(
    'code', v_row.code,
    'role', v_row.role,
    'created_at', v_row.created_at,
    'expires_at', v_row.expires_at
  );
end;
$$;


-- -----------------------------------------------------------------------------
-- list_invite_codes() -- owner, manager
-- -----------------------------------------------------------------------------
-- Only the codes THIS person made, that are not used and not expired,
-- newest first. One manager can never see another manager's codes.
create function public.list_invite_codes()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.require_role(array['owner', 'manager']::public.user_role[]);

  return (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'code', c.code,
          'role', c.role,
          'created_at', c.created_at,
          'expires_at', c.expires_at
        )
        order by c.created_at desc
      ),
      '[]'::jsonb
    )
    from public.invite_codes c
    where c.created_by = (select auth.uid())
      and c.used_at is null
      and c.expires_at > now()
  );
end;
$$;


-- -----------------------------------------------------------------------------
-- check_invite_code(code) -- anyone, even before login
-- -----------------------------------------------------------------------------
-- Answers one question: "is this code good, and which role does it give?"
-- A new person is not logged in yet, so this one is allowed for the `anon`
-- role as well. To keep guessing pointless, it never says WHY a code is bad:
-- wrong, already used, expired, empty or badly formed all give INVALID_CODE.
-- It never reveals who made the code or anything else about it.
create function public.check_invite_code(code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_code text;
  v_role public.user_role;
begin
  -- People may type small letters or spaces around the code.
  v_code := upper(trim(coalesce(check_invite_code.code, '')));

  if v_code !~ '^[A-HJ-NP-Z2-9]{10}$' then
    raise exception 'INVALID_CODE';
  end if;

  select c.role into v_role
  from public.invite_codes c
  where c.code = v_code
    and c.used_at is null
    and c.expires_at > now();

  if v_role is null then
    raise exception 'INVALID_CODE';
  end if;

  return jsonb_build_object('role', v_role);
end;
$$;


-- -----------------------------------------------------------------------------
-- Who may call them
-- -----------------------------------------------------------------------------
-- create and list: logged-in people only (each function checks the role).
revoke all on function public.create_invite_code(text) from public, anon;
revoke all on function public.list_invite_codes()      from public, anon;
grant execute on function public.create_invite_code(text) to authenticated;
grant execute on function public.list_invite_codes()      to authenticated;

-- check: also people who are not logged in yet (they are about to sign up).
revoke all on function public.check_invite_code(text) from public;
grant execute on function public.check_invite_code(text) to anon, authenticated;
