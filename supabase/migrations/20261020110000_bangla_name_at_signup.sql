-- =============================================================================
-- Migration 11: the sign-up guard also saves an optional Bangla name
-- =============================================================================
-- What this file does, in plain words:
--   The sign-up guard (migration 9) decides who gets in and with which role.
--   This file teaches it one more thing: if the new person typed an OPTIONAL
--   "name in Bangla" at sign-up, save it as `display_name_bn` on their profile.
--
-- Everything else about the guard is EXACTLY as before:
--   * Way 1: a pre-approved email gets the role and name from Sakib's list
--     (and its Bangla name, if Sakib wrote one in `approved_accounts`).
--   * Way 2: a good invite code. The role comes from the CODE, never from the
--     person. A role typed into the sign-up is ignored.
--   * Anything else is refused and no account is created at all.
--
-- The new optional field (sent with the sign-up, next to `display_name`):
--   display_name_bn  the person's name written in Bangla letters
--     * empty or missing  -> saved as nothing (null); the apps show the English name
--     * 1 to 80 letters   -> saved
--     * longer than 80    -> the whole sign-up is refused (INVALID_INPUT)
--
-- "create or replace" keeps the trigger and the permissions of the guard.
--
-- Rules for this folder (see supabase/CLAUDE.md):
--   * Never edit an old migration. Add a NEW file for every change.
-- =============================================================================

create or replace function public.handle_new_user()
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
  -- The optional Bangla name: empty means "none".
  v_name_bn  text := nullif(trim(coalesce(v_meta ->> 'display_name_bn', '')), '');
  v_approved public.approved_accounts;
  v_invite   public.invite_codes;
begin
  if v_email = '' then
    raise exception 'INVALID_INPUT';
  end if;

  -- Way 1: Sakib pre-approved this email. Role, name and Bangla name come
  -- from his list, never from what the person typed.
  select * into v_approved
  from public.approved_accounts a
  where a.email = v_email;

  if found then
    insert into public.profiles (id, display_name, display_name_bn, email, role)
    values (new.id, v_approved.display_name, v_approved.display_name_bn, v_email, v_approved.role);
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

  if v_name_bn is not null and length(v_name_bn) > 80 then
    raise exception 'INVALID_INPUT';
  end if;

  -- The role comes from the CODE, never from the person.
  insert into public.profiles (id, display_name, display_name_bn, email, role)
  values (new.id, v_name, v_name_bn, v_email, v_invite.role);

  update public.invite_codes
  set used_by = new.id, used_at = now()
  where id = v_invite.id;

  return new;
end;
$$;
