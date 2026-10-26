// apps/mobile/src/auth/realAuth.ts
//
// The REAL login and logout, replacing the old fake login. Steps:
//   1. Log in with email and password (Supabase Auth).
//   2. Ask the backend who this person is: `get_my_profile()` (docs/api-contract.md 4.1).
//   3. If the person's role belongs to the website (manager or owner), log them
//      straight out again and fail with WRONG_PLATFORM. The backend does not send
//      this code itself, so the app decides it from the role (PLATFORM_FOR_ROLE).
//
// Failures throw an Error whose message is a code from the contract, so the login
// screen can turn it into a friendly sentence. A wrong email or password is
// NOT_AUTHENTICATED; an empty box is INVALID_INPUT.
// It also holds the sign-up call for new workers and technicians.
// Owned by Rubaiya.

import { ApiError, PLATFORM_FOR_ROLE, signUpWithCode } from '@garmentpulse/shared';
import type { Profile, Role } from '@garmentpulse/shared';
import { api, supabase } from '../backend/supabase';

export async function login(email: string, password: string): Promise<Profile> {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === '' || password === '') {
    throw new ApiError('INVALID_INPUT');
  }

  const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
  if (error) {
    // Supabase's own messages are not contract codes. A bad email or password is the
    // usual reason; anything else (like no internet) is shown as a general error.
    throw new ApiError(error.status === 400 ? 'NOT_AUTHENTICATED' : 'UNKNOWN');
  }

  let profile: Profile;
  try {
    profile = await api.getMyProfile();
  } catch (problem) {
    await supabase.auth.signOut();
    throw problem;
  }

  if (PLATFORM_FOR_ROLE[profile.role] !== 'mobile') {
    await supabase.auth.signOut();
    throw new ApiError('WRONG_PLATFORM');
  }
  return profile;
}

/**
 * Sign-up with an invite code (docs/api-contract.md 4.7). The code decides the role;
 * the shared helper checks it, refuses a website code (WRONG_PLATFORM) and returns
 * the new profile. The person is already logged in afterwards.
 */
export async function signUp(input: {
  fullName: string;
  email: string;
  password: string;
  code: string;
  /** The button the person chose (Worker or Technician). */
  chosenRole: 'worker' | 'technician';
}): Promise<Profile> {
  const { chosenRole, ...rest } = input;
  // Ask the code first (it is not used up by asking). If it is for the other
  // phone role, stop BEFORE any account is made. Website codes fall through to
  // signUpWithCode, which refuses them with WRONG_PLATFORM.
  const { role } = await api.checkInviteCode(rest.code);
  if ((role === 'worker' || role === 'technician') && role !== chosenRole) {
    throw new RoleMismatchError(role);
  }
  return signUpWithCode(supabase, { platform: 'mobile', ...rest });
}

/** Thrown when the invite code is for the other phone role than the one chosen. */
export class RoleMismatchError extends Error {
  constructor(public readonly codeRole: Role) {
    super('ROLE_MISMATCH');
  }
}

/** Logs the person out of the backend. */
export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}
