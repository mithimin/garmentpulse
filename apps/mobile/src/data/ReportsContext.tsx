// apps/mobile/src/data/ReportsContext.tsx
//
// A FAKE copy of the reports "database", kept only in the phone's memory, so the
// worker screens can be built before Sakib's backend exists. It starts with the
// shared fake reports (FAKE_REPORTS) and the fake machines (FAKE_MACHINES), and
// copies the behaviour of these functions from docs/api-contract.md:
//   - list_machines()          -> `machines`
//   - list_my_reports()        -> `listMyReports(profile)`
//   - create_report(m, text)   -> `createReport(profile, machineId, description)`
// When something is wrong, `createReport` throws an Error whose message is an
// error code from the contract (INVALID_INPUT, NOT_FOUND, NOT_ALLOWED), exactly
// like the real backend will.
//
// Reports made here disappear when the app is closed. That is expected until the
// real backend is connected. Only this file (and the screens that call it) need
// to change then.
// Owned by Rubaiya.

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { FAKE_MACHINES, FAKE_REPORTS } from '@garmentpulse/shared';
import type { Machine, Profile, Report } from '@garmentpulse/shared';

/** The longest description the backend accepts (docs/api-contract.md 4.3). */
export const MAX_DESCRIPTION_LENGTH = 500;

/** Pretends to wait for the network, so the "Sending…" message can be seen. */
const FAKE_DELAY_MS = 500;

type ReportsValue = {
  machines: Machine[];
  /** Newest first, only the reports made by this person. */
  listMyReports: (profile: Profile) => Report[];
  createReport: (profile: Profile, machineId: string, description: string) => Promise<Report>;
};

const ReportsContext = createContext<ReportsValue | null>(null);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>(() => [...FAKE_REPORTS]);

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
      setReports((current) => [report, ...current]);
      return report;
    },
    [],
  );

  const value = useMemo(
    () => ({ machines: FAKE_MACHINES, listMyReports, createReport }),
    [listMyReports, createReport],
  );
  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

/** Gives a screen the (fake) machines and reports functions. */
export function useReports(): ReportsValue {
  const value = useContext(ReportsContext);
  if (!value) throw new Error('useReports must be used inside <ReportsProvider>');
  return value;
}
