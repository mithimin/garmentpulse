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
//   - A worker or technician email fails with WRONG_PLATFORM, because they use
//     the phone app and not the website.
//
// Failures throw an Error whose message is an error code from the contract, exactly
// like the real backend will. The page turns the code into a friendly sentence.
// When the real backend is ready, only this file (and AuthContext) is swapped out.
// Owned by Mithi.

import { FAKE_PEOPLE, PLATFORM_FOR_ROLE } from '@garmentpulse/shared';
import type { Profile, Role } from '@garmentpulse/shared';

/** Pretends to wait for the network, so the "Loading" message can be seen. */
const FAKE_DELAY_MS = 400;

export async function fakeLogin(email: string, password: string, loginFor: Role): Promise<Profile> {
  await new Promise((resolve) => setTimeout(resolve, FAKE_DELAY_MS));

  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === '' || password === '') {
    throw new Error('INVALID_INPUT');
  }

  const person = FAKE_PEOPLE.find((p) => p.email.toLowerCase() === cleanEmail);
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
