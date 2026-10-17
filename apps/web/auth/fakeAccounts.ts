// apps/web/auth/fakeAccounts.ts
//
// FAKE storage for sign-up, used until Sakib's real backend exists.
// It keeps two small lists in this browser (localStorage, a little notebook the
// browser keeps even after the tab closes):
//   1. accounts that people made on the sign-up page, and
//   2. the one-time manager codes (OTPs) that the owner created.
// A manager code works ONCE: when a manager signs up with it, it is crossed out.
// Passwords are NOT stored (the fake login accepts any password, see fakeAuth.ts).
// When the real backend is ready, this whole file is thrown away.
// Owned by Mithi.

import type { Profile } from '@garmentpulse/shared';

const ACCOUNTS_KEY = 'garmentpulse-web-fake-accounts';
const CODES_KEY = 'garmentpulse-web-fake-manager-codes';

/** The fixed fake code a new OWNER must type to sign up. Test value only. */
export const FAKE_OWNER_CODE = 'OWNER-2026';

export type ManagerCode = { code: string; created_at: string };

function readList<T>(key: string): T[] {
  try {
    const text = window.localStorage.getItem(key);
    const value: unknown = text ? JSON.parse(text) : [];
    return Array.isArray(value) ? (value as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, list: T[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // Storage blocked: the fake data just will not be remembered.
  }
}

/** Accounts made on the sign-up page (not the built-in fake people). */
export function listSignedUpAccounts(): Profile[] {
  return readList<Profile>(ACCOUNTS_KEY);
}

export function addSignedUpAccount(profile: Profile): void {
  writeList(ACCOUNTS_KEY, [...listSignedUpAccounts(), profile]);
}

/** Manager codes the owner made that nobody has used yet, newest first. */
export function listManagerCodes(): ManagerCode[] {
  return readList<ManagerCode>(CODES_KEY);
}

/** The owner asks for a new one-time manager code (6 digits). */
export function createManagerCode(): ManagerCode {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const created: ManagerCode = { code, created_at: new Date().toISOString() };
  writeList(CODES_KEY, [created, ...listManagerCodes()]);
  return created;
}

/** True and crosses the code out if it exists; false if it is wrong or already used. */
export function consumeManagerCode(code: string): boolean {
  const codes = listManagerCodes();
  const found = codes.some((c) => c.code === code.trim());
  if (found)
    writeList(
      CODES_KEY,
      codes.filter((c) => c.code !== code.trim()),
    );
  return found;
}
