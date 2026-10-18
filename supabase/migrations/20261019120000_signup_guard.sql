-- =============================================================================
-- Migration 9: the sign-up guard (step A3 of sign-up with invite codes)
-- =============================================================================
-- What this file does, in plain words:
--   Puts a GUARD on the front door of the login system. Every time a new
--   account is added to Supabase's login list (auth.users), the guard runs and
--   decides who the new person is. There are exactly TWO ways in:
--
--     1. A PRE-APPROVED ACCOUNT. Sakib writes an email, a role and a name into
--        the table `approved_accounts` (by hand, with SQL). When that email is
--        added (by Sakib in the dashboard, or by the person signing up), the
--        guard creates the profile with THAT role. This is how owner accounts
--        and the test accounts are made. People cannot add themselves to this
--        table: it is locked.
--     2. A GOOD INVITE CODE. The person gives a code (not used, not expired).
--        The guard creates the profile with the role OF THE CODE, then marks
--        the code as used.
--
--   Anything else is REFUSED, and no account is created at all.
--
-- The role never comes from the person. A role typed into the sign-up form
-- (or any other extra data) is ignored. Only the approved list or the code
-- decide it.
--
-- Why a guard in the database: the apps are only screens. A changed app, or
-- someone calling Supabase directly, still cannot get in without a good code.
--
-- Rules for this folder (see supabase/CLAUDE.md):
--   * Never edit an old migration. Add a NEW file for every change.
--   * Row Level Security (a lock on each row) is on for every table.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- approved_accounts: accounts Sakib approves by hand
-- -----------------------------------------------------------------------------
create table public.approved_accounts (
  -- Always small letters, so "Farhan@Example.com" and "farhan@example.com" match.
  email         text primary key check (email = lower(email) and length(trim(email)) > 0),
  role          public.user_role not null,
  display_name  text not null check (length(trim(display_name)) > 0),
  created_at    timestamptz not null default now()
);

-- Locked for everybody. Only Sakib (SQL Editor) and the guard can touch it.
alter table public.approved_accounts enable row level security;
revoke all on public.approved_accounts from anon, authenticated;


-- -----------------------------------------------------------------------------
-- The guard
-- -----------------------------------------------------------------------------
-- It runs right AFTER a row is added to auth.users, in the same step. If the
-- guard raises an error, the whole sign-up is undone and no account exists.
--
-- Extra data an app may send when signing up (all optional except the code):
--   invite_code   the code the person was given
--   display_name  the name the person types (used with a code)
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email    text := lower(trim(coalesce(new.email, '')));
  v_meta     jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_code     text := upper(trim(coalesce(v_meta ->> 'invite_code', '')));
  v_name     text := trim(coalesce(v_meta ->> 'display_name', ''));
  v_approved public.approved_accounts;
  v_invite   public.invite_codes;
begin
  if v_email = '' then
    raise exception 'INVALID_INPUT';
  end if;

  -- Way 1: Sakib pre-approved this email. The role and name come from his list.
  select * into v_approved
  from public.approved_accounts a
  where a.email = v_email;

  if found then
    insert into public.profiles (id, display_name, email, role)
    values (new.id, v_approved.display_name, v_email, v_approved.role);
    return new;
  end if;

  -- Way 2: a good invite code. Anything else is refused.
  if v_code !~ '^[A-HJ-NP-Z2-9]{10}$' then
    raise exception 'INVALID_CODE';
  end if;

  -- Lock the code row, so two people cannot use the same code at the same moment.
  select * into v_invite
  from public.invite_codes c
  where c.code = v_code
    and c.used_at is null
    and c.expires_at > now()
  for update;

  if not found then
    raise exception 'INVALID_CODE';
  end if;

  if length(v_name) not between 1 and 80 then
    raise exception 'INVALID_INPUT';
  end if;

  -- The role comes from the CODE, never from the person.
  insert into public.profiles (id, display_name, email, role)
  values (new.id, v_name, v_email, v_invite.role);

  update public.invite_codes
  set used_by = new.id, used_at = now()
  where id = v_invite.id;

  return new;
end;
$$;

-- Nobody calls the guard by hand: only the trigger below runs it.
revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
