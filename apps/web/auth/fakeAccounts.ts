// apps/web/auth/fakeAccounts.ts
//
// FAKE storage for sign-up, used until Sakib's real backend exists.
// It keeps two small lists in this browser (localStorage, a little notebook the
// browser keeps even after the tab closes):
//   1. accounts that people made on the sign-up page, and
//   2. the invite codes people made (docs/api-contract.md 4.7): 10 letters and
//      numbers, one role each, valid for 7 days.
// A code works ONCE: when someone signs up with it, it is crossed out.
// Passwords are NOT stored (the fake login accepts any password, see fakeAuth.ts).
// When the real backend is ready, this whole file is thrown away.
// Owned by Mithi.

import type { Profile } from '@garmentpulse/shared';

const ACCOUNTS_KEY = 'garmentpulse-web-fake-accounts';
const CODES_KEY = 'garmentpulse-web-fake-invite-codes';

export type InviteRole = 'worker' | 'technician' | 'manager';

/** Same shape as the planned real code (docs/api-contract.md 4.7). */
export type InviteCode = {
  code: string;
  role: InviteRole;
  created_at: string;
  expires_at: string;
};

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

/** Letters and numbers for codes: no look-alikes (no 0/O, 1/I/L). */
const CODE_LETTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 10;
const CODE_LIFETIME_DAYS = 7;

/** Makes the text of a new code, like "K7M2QX9PTB". */
function randomCodeText(): string {
  let text = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    text += CODE_LETTERS[Math.floor(Math.random() * CODE_LETTERS.length)];
  }
  return text;
}

/** People may type a code in small letters or with spaces; compare the clean version. */
function cleanCode(code: string): string {
  return code.replace(/\s|-/g, '').toUpperCase();
}

/** Codes nobody has used yet and that have not expired, newest first. */
export function listInviteCodes(): InviteCode[] {
  const now = Date.now();
  return readList<InviteCode>(CODES_KEY).filter((c) => new Date(c.expires_at).getTime() > now);
}

/** Makes a new one-time invite code for the given role (valid for 7 days). */
export function createInviteCode(role: InviteRole): InviteCode {
  const now = new Date();
  const expires = new Date(now.getTime() + CODE_LIFETIME_DAYS * 24 * 60 * 60 * 1000);
  const created: InviteCode = {
    code: randomCodeText(),
    role,
    created_at: now.toISOString(),
    expires_at: expires.toISOString(),
  };
  writeList(CODES_KEY, [created, ...listInviteCodes()]);
  return created;
}

/** The role a good code gives, or null if the code is wrong, used or expired. */
export function checkInviteCode(code: string): InviteRole | null {
  const clean = cleanCode(code);
  const found = listInviteCodes().find((c) => c.code === clean);
  return found ? found.role : null;
}

/** Crosses the code out so it cannot be used again. */
export function crossOutInviteCode(code: string): void {
  const clean = cleanCode(code);
  writeList(
    CODES_KEY,
    listInviteCodes().filter((c) => c.code !== clean),
  );
}
