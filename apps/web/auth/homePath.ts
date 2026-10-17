// apps/web/auth/homePath.ts
//
// Says which page each role starts on after logging in.
// Only managers and owners use the website. Owned by Mithi.

import type { Role } from '@garmentpulse/shared';

export function homePathFor(role: Role): string {
  return role === 'owner' ? '/owner' : '/manager';
}
