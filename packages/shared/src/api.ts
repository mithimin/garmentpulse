// packages/shared/src/api.ts
//
// Ready-made, typed wrappers for the backend functions in docs/api-contract.md
// (section 4). Instead of typing function names by hand, an app writes:
//
//     const api = createApi(supabase);
//     const reports = await api.listMyReports();
//
// Why this file exists:
//   * The exact function names and input names live in ONE place, so a typo
//     cannot sneak into an app.
//   * Every call returns the shapes from types.ts.
//   * Every failure becomes an `ApiError` with a known `code` (see errors.ts).
//     The app turns the code into a friendly sentence. It never shows the raw code.
//
// It does not need the Supabase library. It only needs something with an
// `rpc(name, args)` method, which is exactly what the Supabase client has.
// The apps write no other backend calls: they never touch tables directly
// (docs/api-contract.md section 2.1).
//
// If a function in the contract changes, change it here too. Owned by Sakib.

import { getApiErrorCode, UNKNOWN_ERROR, type ApiErrorCode } from './errors';
import { PLATFORM_FOR_ROLE } from './types';
import type {
  CodeCheck,
  InviteCode,
  InviteRole,
  Machine,
  OwnerSummary,
  Platform,
  Profile,
  Report,
  ReportStatus,
  Technician,
} from './types';

/** The smallest part of the Supabase client these wrappers need. */
export type RpcClient = {
  rpc(
    name: string,
    args?: Record<string, unknown>,
  ): PromiseLike<{ data: unknown; error: { message?: string } | null }>;
};

/** What a failed backend call turns into. `code` is one of the contract's error codes. */
export class ApiError extends Error {
  readonly code: ApiErrorCode;

  constructor(code: ApiErrorCode) {
    super(code);
    this.name = 'ApiError';
    this.code = code;
  }
}

/** The two statuses a technician may move a job to (contract section 4.5). */
export type JobStatusUpdate = Extract<ReportStatus, 'in_progress' | 'resolved'>;

/** Builds the wrappers around a Supabase client (or anything with `rpc`). */
export function createApi(client: RpcClient) {
  async function call<T>(name: string, args?: Record<string, unknown>): Promise<T> {
    const { data, error } = await client.rpc(name, args);
    if (error) {
      throw new ApiError(getApiErrorCode(error));
    }
    return data as T;
  }

  return {
    // 4.1 Account and login (the login itself is Supabase Auth, not a wrapper)
    getMyProfile: () => call<Profile>('get_my_profile'),

    // 4.2 Machines
    listMachines: () => call<Machine[]>('list_machines'),

    // 4.3 Reports
    createReport: (machineId: string, description: string) =>
      call<Report>('create_report', { machine_id: machineId, description }),
    listMyReports: () => call<Report[]>('list_my_reports'),
    listReports: (status?: ReportStatus) =>
      call<Report[]>('list_reports', { status: status ?? null }),
    getReport: (reportId: string) => call<Report>('get_report', { report_id: reportId }),

    // 4.4 Dispatch (manager)
    listTechnicians: () => call<Technician[]>('list_technicians'),
    assignTechnician: (reportId: string, technicianId: string) =>
      call<Report>('assign_technician', { report_id: reportId, technician_id: technicianId }),

    // 4.5 Technician jobs
    listMyJobs: (includePast = false) =>
      call<Report[]>('list_my_jobs', { include_past: includePast }),
    acceptJob: (reportId: string) => call<Report>('accept_job', { report_id: reportId }),
    updateJobStatus: (reportId: string, status: JobStatusUpdate) =>
      call<Report>('update_job_status', { report_id: reportId, status }),

    // 4.6 Owner view
    getOwnerSummary: () => call<OwnerSummary>('get_owner_summary'),

    // 4.7 Invite codes for sign-up
    /** Works BEFORE login. Fails with INVALID_CODE for a wrong, used or expired code. */
    checkInviteCode: (code: string) => call<CodeCheck>('check_invite_code', { code }),
    /** Owner: manager codes. Manager: worker and technician codes. */
    createInviteCode: (role: InviteRole) => call<InviteCode>('create_invite_code', { role }),
    /** The caller's own codes that are not used and not expired. */
    listInviteCodes: () => call<InviteCode[]>('list_invite_codes'),
  };
}

/** The wrappers' type, handy for apps that pass the api around. */
export type Api = ReturnType<typeof createApi>;

// -----------------------------------------------------------------------------
// Sign-up with an invite code (docs/api-contract.md section 4.7)
// -----------------------------------------------------------------------------

/** Supabase's own default for the shortest password. */
export const MIN_PASSWORD_LENGTH = 6;

/** The longest name the sign-up guard in the database accepts. */
export const MAX_NAME_LENGTH = 80;

/**
 * The smallest part of the Supabase client that sign-up needs: the `rpc`
 * method above, plus `auth.signUp`. The real Supabase client has both.
 */
export type SignUpClient = RpcClient & {
  auth: {
    signUp(credentials: {
      email: string;
      password: string;
      options?: { data?: Record<string, unknown> };
    }): PromiseLike<{
      data: { user: { identities?: unknown[] | null } | null; session: unknown | null };
      error: { message?: string } | null;
    }>;
  };
};

export type SignUpInput = {
  /** Which app is asking: workers and technicians sign up on mobile, managers on web. */
  platform: Platform;
  fullName: string;
  email: string;
  password: string;
  /** The invite code the person was given. Small letters and spaces are fine. */
  code: string;
};

/** Turns the message of a failed Supabase sign-up into one of our codes. */
function signUpErrorCode(message: string | undefined): ApiErrorCode {
  const text = (message ?? '').toLowerCase();
  if (text.includes('already') && (text.includes('registered') || text.includes('exists'))) {
    return 'EMAIL_TAKEN';
  }
  // Our sign-up guard in the database refused the new person. The code was good
  // a moment ago (we checked it), so it was probably used or expired in between.
  if (text.includes('database error saving new user')) {
    return 'INVALID_CODE';
  }
  if (text.includes('password') || text.includes('email address') || text.includes('invalid')) {
    return 'INVALID_INPUT';
  }
  return UNKNOWN_ERROR;
}

/**
 * Signs a new person up with an email, a password and an invite code, and
 * returns their profile (so the app knows the role and can open the right
 * screens). The steps, in order:
 *
 *   1. Check the name, email and password. (INVALID_INPUT)
 *   2. Ask the backend if the code is good. (INVALID_CODE)
 *   3. Make sure the code's role belongs to THIS app. (WRONG_PLATFORM)
 *      Nothing has been created yet if it does not.
 *   4. Sign up with Supabase. The database guard checks the code again and
 *      gives the person the role OF THE CODE. A role typed by the person is
 *      ignored. (EMAIL_TAKEN, INVALID_CODE, INVALID_INPUT)
 *   5. Read the new person's profile. They are already logged in.
 *
 * Every problem becomes an `ApiError` with one of the codes in errors.ts. The
 * app turns the code into a friendly sentence. After this returns, the app
 * should give its live-update connection the login (`realtime.setAuth`), just
 * like after any login.
 */
export async function signUpWithCode(client: SignUpClient, input: SignUpInput): Promise<Profile> {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const code = input.code.trim().toUpperCase();

  // 1. The easy mistakes, caught before anything is sent.
  if (
    fullName.length < 1 ||
    fullName.length > MAX_NAME_LENGTH ||
    !email.includes('@') ||
    input.password.length < MIN_PASSWORD_LENGTH
  ) {
    throw new ApiError('INVALID_INPUT');
  }

  const api = createApi(client);

  // 2. Is the code good? (This works before login.)
  const { role } = await api.checkInviteCode(code);

  // 3. Does the code's role belong to this app?
  if (PLATFORM_FOR_ROLE[role] !== input.platform) {
    throw new ApiError('WRONG_PLATFORM');
  }

  // 4. Sign up. The role comes from the code, never from us.
  const { data, error } = await client.auth.signUp({
    email,
    password: input.password,
    options: { data: { display_name: fullName, invite_code: code } },
  });
  if (error) {
    throw new ApiError(signUpErrorCode(error.message));
  }
  // When an email already has an account, Supabase may answer "success" with an
  // empty list of identities instead of an error.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new ApiError('EMAIL_TAKEN');
  }
  // No session means the project still asks for email confirmation, which the
  // MVP switches off. Tell the app plainly that something is set up wrong.
  if (!data.session) {
    throw new ApiError(UNKNOWN_ERROR);
  }

  // 5. The new person is logged in. Read their profile.
  return api.getMyProfile();
}
