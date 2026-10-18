// apps/web/auth/realAuth.ts
//
// The REAL login, used when the backend values are filled in (see lib/backend.ts).
// Login is Supabase Auth (email and password), then `get_my_profile()` tells us
// who the person is (docs/api-contract.md 4.1). Same rules as the fake login:
//   - A worker or technician is signed out again with WRONG_PLATFORM.
//   - A manager on the owner login (or the owner on the manager login) is signed
//     out again with NOT_AUTHENTICATED, so the page does not reveal the other door.
// Failures throw an Error whose message is an error code from the contract.
// Owned by Mithi.

import { PLATFORM_FOR_ROLE } from '@garmentpulse/shared';
import type { Profile, Role } from '@garmentpulse/shared';
import { api, supabase } from '../lib/backend';

export async function realLogin(email: string, password: string, loginFor: Role): Promise<Profile> {
  if (!supabase || !api) throw new Error('NOT_AUTHENTICATED');

  const cleanEmail = email.trim();
  if (cleanEmail === '' || password === '') throw new Error('INVALID_INPUT');

  const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
  if (error) throw new Error('NOT_AUTHENTICATED');

  try {
    const profile = await api.getMyProfile();
    if (PLATFORM_FOR_ROLE[profile.role] !== 'web') throw new Error('WRONG_PLATFORM');
    if (profile.role !== loginFor) throw new Error('NOT_AUTHENTICATED');
    return profile;
  } catch (error) {
    await supabase.auth.signOut();
    throw error;
  }
}

/** Asks Supabase if someone is still logged in (for example after a page refresh). */
export async function realRestore(): Promise<Profile | null> {
  if (!supabase || !api) return null;
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;
  try {
    const profile = await api.getMyProfile();
    return PLATFORM_FOR_ROLE[profile.role] === 'web' ? profile : null;
  } catch {
    return null;
  }
}

export async function realLogOut(): Promise<void> {
  await supabase?.auth.signOut();
}
