// apps/mobile/src/data/ReportsContext.tsx
//
// A FAKE copy of the reports "database", kept only in the phone's memory, so the
// worker screens can be built before Sakib's backend exists. It starts with the
// shared fake reports (FAKE_REPORTS) and the fake machines (FAKE_MACHINES), and
// copies the behaviour of these functions from docs/api-contract.md:
//   - list_machines()          -> `machines`
//   - list_my_reports()        -> `listMyReports(profile)`
//   - create_report(m, text)   -> `createReport(profile, machineId, description)`
//   - list_my_jobs(past?)      -> `listMyJobs(profile, includePast)`
//   - accept_job(report_id)    -> `acceptJob(profile, reportId)`
//   - update_job_status(id, s) -> `updateJobStatus(profile, reportId, status)`
// When something is wrong, these functions throw an Error whose message is an
// error code from the contract (INVALID_INPUT, NOT_FOUND, NOT_ALLOWED,
// JOB_ALREADY_ACCEPTED, JOB_NOT_ACCEPTED, INVALID_STATUS_CHANGE), exactly like
// the real backend will.
// Because workers and technicians share this one store, a worker who logs in
// after a technician changed a status sees the change.
//
// Reports made here disappear when the app is closed. That is expected until the
// real backend is connected. Only this file (and the screens that call it) need
// to change then.
// Owned by Rubaiya.

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { FAKE_MACHINES, FAKE_REPORTS } from '@garmentpulse/shared';
import type { Machine, Profile, Report, ReportStatus } from '@garmentpulse/shared';

/** The longest description the backend accepts (docs/api-contract.md 4.3). */
export const MAX_DESCRIPTION_LENGTH = 500;

/** Pretends to wait for the network, so the "Sending…" message can be seen. */
const FAKE_DELAY_MS = 500;

type ReportsValue = {
  machines: Machine[];
  /** Newest first, only the reports made by this person. */
  listMyReports: (profile: Profile) => Report[];
  createReport: (profile: Profile, machineId: string, description: string) => Promise<Report>;
  /** Jobs assigned to this technician, newest first. Resolved ones only when `includePast`. */
  listMyJobs: (profile: Profile, includePast: boolean) => Report[];
  acceptJob: (profile: Profile, reportId: string) => Promise<Report>;
  updateJobStatus: (
    profile: Profile,
    reportId: string,
    status: 'in_progress' | 'resolved',
  ) => Promise<Report>;
};

/** The order of the statuses; a job may only move to a later one. */
const STATUS_ORDER: Record<ReportStatus, number> = { waiting: 0, in_progress: 1, resolved: 2 };

const ReportsContext = createContext<ReportsValue | null>(null);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>(() => [...FAKE_REPORTS]);
  // The newest list, readable inside functions that run after an await.
  const reportsRef = useRef(reports);
  const commit = useCallback((next: Report[]) => {
    reportsRef.current = next;
    setReports(next);
  }, []);

  const listMyReports = useCallback(
    (profile: Profile) =>
      reports
        .filter((report) => report.reported_by.id === profile.id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [reports],
  );

  const createReport = useCallback(
    async (profile: Profile, machineId: string, description: string) => {
      await new Promise((resolve) => setTimeout(resolve, FAKE_DELAY_MS));

      if (profile.role !== 'worker') throw new Error('NOT_ALLOWED');
      const text = description.trim();
      if (text.length < 1 || text.length > MAX_DESCRIPTION_LENGTH) {
        throw new Error('INVALID_INPUT');
      }
      const machine = FAKE_MACHINES.find((m) => m.id === machineId);
      if (!machine) throw new Error('NOT_FOUND');

      const now = new Date().toISOString();
      const report: Report = {
        id: `r-new-${Date.now()}`,
        machine: { id: machine.id, name: machine.name },
        description: text,
        status: 'waiting',
        reported_by: { id: profile.id, display_name: profile.display_name },
        technician: null,
        accepted_at: null,
        created_at: now,
        updated_at: now,
      };
      commit([report, ...reportsRef.current]);
      return report;
    },
    [commit],
  );

  const listMyJobs = useCallback(
    (profile: Profile, includePast: boolean) =>
      reports
        .filter(
          (report) =>
            report.technician?.id === profile.id && (includePast || report.status !== 'resolved'),
        )
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [reports],
  );

  /** Finds a job that is assigned to this technician, or throws the right error code. */
  const findMyJob = useCallback((profile: Profile, reportId: string): Report => {
    if (profile.role !== 'technician') throw new Error('NOT_ALLOWED');
    const report = reportsRef.current.find((r) => r.id === reportId);
    if (!report) throw new Error('NOT_FOUND');
    // A job that is not assigned to this technician is "not allowed".
    if (report.technician?.id !== profile.id) throw new Error('NOT_ALLOWED');
    return report;
  }, []);

  /** Saves a changed copy of one report and returns it. */
  const replaceReport = useCallback(
    (changed: Report) => {
      commit(reportsRef.current.map((r) => (r.id === changed.id ? changed : r)));
      return changed;
    },
    [commit],
  );

  const acceptJob = useCallback(
    async (profile: Profile, reportId: string) => {
      await new Promise((resolve) => setTimeout(resolve, FAKE_DELAY_MS));
      const report = findMyJob(profile, reportId);
      if (report.accepted_at) throw new Error('JOB_ALREADY_ACCEPTED');
      // Accepting does not change the status (api-contract.md section 8, point 1).
      const now = new Date().toISOString();
      return replaceReport({ ...report, accepted_at: now, updated_at: now });
    },
    [findMyJob, replaceReport],
  );

  const updateJobStatus = useCallback(
    async (profile: Profile, reportId: string, status: 'in_progress' | 'resolved') => {
      await new Promise((resolve) => setTimeout(resolve, FAKE_DELAY_MS));
      if (status !== 'in_progress' && status !== 'resolved') throw new Error('INVALID_INPUT');
      const report = findMyJob(profile, reportId);
      if (!report.accepted_at) throw new Error('JOB_NOT_ACCEPTED');
      // Moves go forward only; "resolved" is final.
      if (STATUS_ORDER[status] <= STATUS_ORDER[report.status]) {
        throw new Error('INVALID_STATUS_CHANGE');
      }
      return replaceReport({ ...report, status, updated_at: new Date().toISOString() });
    },
    [findMyJob, replaceReport],
  );

  const value = useMemo(
    () => ({
      machines: FAKE_MACHINES,
      listMyReports,
      createReport,
      listMyJobs,
      acceptJob,
      updateJobStatus,
    }),
    [listMyReports, createReport, listMyJobs, acceptJob, updateJobStatus],
  );
  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

/** Gives a screen the (fake) machines and reports functions. */
export function useReports(): ReportsValue {
  const value = useContext(ReportsContext);
  if (!value) throw new Error('useReports must be used inside <ReportsProvider>');
  return value;
}
