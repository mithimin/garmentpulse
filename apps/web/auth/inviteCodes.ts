// apps/web/auth/inviteCodes.ts
//
// The ONE place the code pages ask for invite codes (docs/api-contract.md 4.7).
// With the real backend connected (lib/backend.ts) it calls `create_invite_code`
// and `list_invite_codes`. Without it, it uses the FAKE codes saved in the browser
// (auth/fakeAccounts.ts). The pages do not need to know which one is used.
// Owned by Mithi.

import type { InviteCode, InviteRole } from '@garmentpulse/shared';
import { api } from '../lib/backend';
import { createInviteCode as fakeCreate, listInviteCodes as fakeList } from './fakeAccounts';

/** Makes a new one-time code for the given role and returns it. */
export async function makeCode(role: InviteRole): Promise<InviteCode> {
  return api ? api.createInviteCode(role) : fakeCreate(role);
}

/** The unused, not-yet-expired codes this person made (newest first). */
export async function myUnusedCodes(): Promise<InviteCode[]> {
  return api ? api.listInviteCodes() : fakeList();
}
