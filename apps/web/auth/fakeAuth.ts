// apps/web/auth/fakeAuth.ts
//
// A FAKE login, used until Sakib's real backend exists. It looks up the email in
// the shared fake people list (FAKE_PEOPLE) and returns that person's profile,
// the same shape the real `get_my_profile()` will return (docs/api-contract.md 4.1).
//
// Fake rules (only for building screens):
//   - Any password works, as long as it is not empty.
//   - An email of the other website role (manager on the owner login, or the
//     owner on the manager login) fails with NOT_AUTHENTICATED.
//   - Accounts made on the sign-up page can log in too (see fakeAccounts.ts).
//   - A worker or technician email fails with WRONG_PLATFORM, because they use
//     the phone app and not the website.
//
// Failures throw an Error whose message is an error code from the contract, exactly
// like the real backend will. The page turns the code into a friendly sentence.
// When the real backend is ready, only this file (and AuthContext) is swapped out.
// Owned by Mithi.

import { FAKE_PEOPLE, PLATFORM_FOR_ROLE } from '@garmentpulse/shared';
import type { Profile, Role } from '@garmentpulse/shared';
import {
  addSignedUpAccount,
  checkInviteCode,
  crossOutInviteCode,
  listSignedUpAccounts,
} from './fakeAccounts';

/** Pretends to wait for the network, so the "Loading" message can be seen. */
const FAKE_DELAY_MS = 400;

export async function fakeLogin(email: string, password: string, loginFor: Role): Promise<Profile> {
  await new Promise((resolve) => setTimeout(resolve, FAKE_DELAY_MS));

  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === '' || password === '') {
    throw new Error('INVALID_INPUT');
  }

  const person = [...FAKE_PEOPLE, ...listSignedUpAccounts()].find(
    (p) => p.email.toLowerCase() === cleanEmail,
  );
  if (!person) {
    throw new Error('NOT_AUTHENTICATED');
  }

  // Workers and technicians must use the phone app, not the website.
  if (PLATFORM_FOR_ROLE[person.role] !== 'web') {
    throw new Error('WRONG_PLATFORM');
  }

  // The manager login and the owner login are separate doors. An account that
  // belongs to the other door gets the same answer as a wrong password, so the
  // page does not reveal that the other door exists.
  if (person.role !== loginFor) {
    throw new Error('NOT_AUTHENTICATED');
  }

  return person;
}

/** Sign-up error codes (docs/api-contract.md 4.7). */
export type SignUpErrorCode = 'EMAIL_TAKEN' | 'INVALID_CODE';

export type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
  /** The invite code. It decides the role: nobody picks their own role. */
  code: string;
};

/**
 * A FAKE sign-up with an invite code (docs/api-contract.md 4.7). Steps, in order:
 * the code must be good (INVALID_CODE), its role must belong to the website
 * (WRONG_PLATFORM for worker and technician codes), the email must be new
 * (EMAIL_TAKEN). The code is crossed out after use. Owners never sign up.
 */
export async function fakeSignUp(input: SignUpInput): Promise<Profile> {
  await new Promise((resolve) => setTimeout(resolve, FAKE_DELAY_MS));

  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  if (fullName === '' || !email.includes('@') || input.password.length < 6) {
    throw new Error('INVALID_INPUT');
  }

  const role = checkInviteCode(input.code);
  if (role === null) throw new Error('INVALID_CODE' satisfies SignUpErrorCode);
  if (PLATFORM_FOR_ROLE[role] !== 'web') throw new Error('WRONG_PLATFORM');

  const taken = [...FAKE_PEOPLE, ...listSignedUpAccounts()].some(
    (p) => p.email.toLowerCase() === email,
  );
  if (taken) throw new Error('EMAIL_TAKEN' satisfies SignUpErrorCode);

  crossOutInviteCode(input.code);
  const profile: Profile = { id: `u-new-${Date.now()}`, display_name: fullName, email, role };
  addSignedUpAccount(profile);
  return profile;
}
