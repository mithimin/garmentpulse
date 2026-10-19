// packages/shared/src/types.ts
//
// The "shapes" of the information the backend sends to the apps.
// These copy Section 3 of docs/api-contract.md exactly. If this file and the
// contract disagree, the contract wins: fix this file. Owned by Sakib.

/** The four kinds of people who use GarmentPulse. */
export type Role = 'worker' | 'technician' | 'manager' | 'owner';

/** Which app a person uses: workers and technicians use the phone app, the rest use the web app. */
export type Platform = 'mobile' | 'web';

/** The three report statuses (same words for everyone). */
export type ReportStatus = 'waiting' | 'in_progress' | 'resolved';

/** Whether a technician can take a new job right now. */
export type TechnicianAvailability = 'free' | 'busy';

export const ROLES: readonly Role[] = ['worker', 'technician', 'manager', 'owner'];
export const REPORT_STATUSES: readonly ReportStatus[] = ['waiting', 'in_progress', 'resolved'];

/** Which app each role belongs to (PRD section 3, architecture section 3). */
export const PLATFORM_FOR_ROLE: Record<Role, Platform> = {
  worker: 'mobile',
  technician: 'mobile',
  manager: 'web',
  owner: 'web',
};

/**
 * The OPTIONAL Bangla name of a person or a machine (`display_name_bn`, `name_bn`).
 * Nobody generates it: a person types it (a Bangla speaker for the test data,
 * the person themselves at sign-up). It is `null` (or missing) when nobody has
 * written one yet, and the app then shows the English name.
 */
export type BanglaName = string | null;

export type Profile = {
  id: string;
  display_name: string;
  /** The person's name in Bangla letters, if they gave one. */
  display_name_bn?: BanglaName;
  email: string;
  role: Role;
};

export type Machine = {
  id: string;
  /** A short name people recognise, for example "Sewing machine 14". */
  name: string;
  /** The machine's name in Bangla letters, if one was written. */
  name_bn?: BanglaName;
};

export type Report = {
  id: string;
  machine: { id: string; name: string; name_bn?: BanglaName };
  /** The worker's typed description of the problem. */
  description: string;
  status: ReportStatus;
  reported_by: { id: string; display_name: string; display_name_bn?: BanglaName };
  /** null means nobody is assigned yet. */
  technician: { id: string; display_name: string; display_name_bn?: BanglaName } | null;
  /** Set when the technician accepts the job. null until then. */
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Technician = {
  id: string;
  display_name: string;
  display_name_bn?: BanglaName;
  availability: TechnicianAvailability;
};

/** The three count boxes on the owner's screen. */
export type OwnerSummary = Record<ReportStatus, number>;

// -----------------------------------------------------------------------------
// Sign-up with invite codes (docs/api-contract.md section 4.7)
// -----------------------------------------------------------------------------

/** The roles an invite code can give. The owner is never created by a code. */
export type InviteRole = 'worker' | 'technician' | 'manager';

export const INVITE_ROLES: readonly InviteRole[] = ['worker', 'technician', 'manager'];

/** An invite code as the owner or a manager sees it in their list. */
export type InviteCode = {
  /** 10 capital letters and digits, without look-alikes (no 0, O, 1 or I). */
  code: string;
  role: InviteRole;
  created_at: string;
  /** A code stops working 7 days after it was made. */
  expires_at: string;
};

/** The answer to "is this code good?" (before sign-up). */
export type CodeCheck = { role: InviteRole };
