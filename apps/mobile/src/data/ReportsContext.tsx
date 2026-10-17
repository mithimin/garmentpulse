// apps/mobile/src/data/ReportsContext.tsx
//
// Holds the machines and reports that the phone screens show, using the REAL
// backend (it replaced the old fake in-memory store). It is a small helper that
// sits between the screens and the backend calls from `@garmentpulse/shared`:
//   - list_machines()          -> `machines`            (workers only)
//   - list_my_reports()        -> `listMyReports(...)`  (workers)
//   - list_my_jobs(past?)      -> `listMyJobs(...)`     (technicians)
//   - create_report(m, text)   -> `createReport(...)`
//   - accept_job(report_id)    -> `acceptJob(...)`
//   - update_job_status(id, s) -> `updateJobStatus(...)`
//
// How it works, in plain words:
//   1. When a person logs in, it downloads their list once (a worker's own
//      reports, or a technician's jobs including past ones).
//   2. It keeps that list in memory so the screens can read it instantly.
//   3. It listens for LIVE UPDATES (Supabase Realtime on the `reports` table).
//      When anything changes, it downloads the list again, so a status change
//      made by the manager or technician shows up within a few seconds.
//   4. Every action (create, accept, change status) asks the backend, which
//      checks the rules. If it says no, the call throws an ApiError whose `code`
//      is an error code from the contract. The screen turns it into a sentence.
//
// The list functions keep their old shape (they take the profile and return the
// list right away), so the screens did not have to change much.
// Owned by Rubaiya.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Machine, Profile, Report } from '@garmentpulse/shared';
import { api, supabase } from '../backend/supabase';

/** The longest description the backend accepts (docs/api-contract.md 4.3). */
export const MAX_DESCRIPTION_LENGTH = 500;

type ReportsValue = {
  machines: Machine[];
  /** True until the first download has finished (or failed). */
  loading: boolean;
  /** True when the last download failed (for example, no internet). */
  loadFailed: boolean;
  /** Downloads the list again. */
  refresh: () => Promise<void>;
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

const ReportsContext = createContext<ReportsValue | null>(null);

/** Puts the newest report first. */
function newestFirst(reports: Report[]): Report[] {
  return [...reports].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/** Swaps one report in a list for its newer copy (or adds it if it is new). */
function withReport(reports: Report[], changed: Report): Report[] {
  return reports.some((r) => r.id === changed.id)
    ? reports.map((r) => (r.id === changed.id ? changed : r))
    : [changed, ...reports];
}

type Props = {
  /** The person who is logged in. Their lists are the ones we download. */
  profile: Profile;
  children: ReactNode;
};

export function ReportsProvider({ profile, children }: Props) {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const refresh = useCallback(async () => {
    try {
      // A technician's jobs include past ones; the History screen needs them.
      const list =
        profile.role === 'technician' ? await api.listMyJobs(true) : await api.listMyReports();
      setReports(list);
      setLoadFailed(false);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, [profile.role]);

  // First download, plus the machines for the worker's dropdown.
  useEffect(() => {
    let cancelled = false;
    void refresh();
    if (profile.role === 'worker') {
      api
        .listMachines()
        .then((list) => {
          if (!cancelled) setMachines(list);
        })
        .catch(() => {
          if (!cancelled) setLoadFailed(true);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [profile.role, refresh]);

  // Live updates: when any report this person may see changes, download again.
  // (The backend only sends changes the person is allowed to see.)
  useEffect(() => {
    const channel = supabase
      .channel(`reports-${profile.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        void refresh();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [profile.id, refresh]);

  const listMyReports = useCallback(
    (me: Profile) => newestFirst(reports.filter((report) => report.reported_by.id === me.id)),
    [reports],
  );

  const listMyJobs = useCallback(
    (me: Profile, includePast: boolean) =>
      newestFirst(
        reports.filter(
          (report) =>
            report.technician?.id === me.id && (includePast || report.status !== 'resolved'),
        ),
      ),
    [reports],
  );

  // The `profile` argument is kept so screens did not need to change; the
  // backend knows who is calling from the login, so it is not sent.
  const createReport = useCallback(async (_me: Profile, machineId: string, description: string) => {
    const report = await api.createReport(machineId, description.trim());
    setReports((current) => withReport(current, report));
    return report;
  }, []);

  const acceptJob = useCallback(async (_me: Profile, reportId: string) => {
    const report = await api.acceptJob(reportId);
    setReports((current) => withReport(current, report));
    return report;
  }, []);

  const updateJobStatus = useCallback(
    async (_me: Profile, reportId: string, status: 'in_progress' | 'resolved') => {
      const report = await api.updateJobStatus(reportId, status);
      setReports((current) => withReport(current, report));
      return report;
    },
    [],
  );

  const value = useMemo(
    () => ({
      machines,
      loading,
      loadFailed,
      refresh,
      listMyReports,
      createReport,
      listMyJobs,
      acceptJob,
      updateJobStatus,
    }),
    [
      machines,
      loading,
      loadFailed,
      refresh,
      listMyReports,
      createReport,
      listMyJobs,
      acceptJob,
      updateJobStatus,
    ],
  );
  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

/** Gives a screen the machines and reports functions. */
export function useReports(): ReportsValue {
  const value = useContext(ReportsContext);
  if (!value) throw new Error('useReports must be used inside <ReportsProvider>');
  return value;
}
