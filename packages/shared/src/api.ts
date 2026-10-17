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

import { getErrorCode, type ErrorCode, type UNKNOWN_ERROR } from './errors';
import type { Machine, OwnerSummary, Profile, Report, ReportStatus, Technician } from './types';

/** The smallest part of the Supabase client these wrappers need. */
export type RpcClient = {
  rpc(
    name: string,
    args?: Record<string, unknown>,
  ): PromiseLike<{ data: unknown; error: { message?: string } | null }>;
};

/** What a failed backend call turns into. `code` is one of the contract's error codes. */
export class ApiError extends Error {
  readonly code: ErrorCode | typeof UNKNOWN_ERROR;

  constructor(code: ErrorCode | typeof UNKNOWN_ERROR) {
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
      throw new ApiError(getErrorCode(error));
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
  };
}

/** The wrappers' type, handy for apps that pass the api around. */
export type Api = ReturnType<typeof createApi>;
