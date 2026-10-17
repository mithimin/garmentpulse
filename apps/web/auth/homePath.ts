// apps/web/auth/homePath.ts
//
// Says which page each role starts on after logging in, and which login page
// each role uses. The manager and the owner have SEPARATE login pages, and
// nothing on one links to the other.
// Only managers and owners use the website. Owned by Mithi.

import type { Role } from '@garmentpulse/shared';

export function homePathFor(role: Role): string {
  return role === 'owner' ? '/owner' : '/manager';
}

/** The login page for a role. Managers use /login; the owner has a separate address. */
export function loginPathFor(role: Role): string {
  return role === 'owner' ? '/owner-login' : '/login';
}
