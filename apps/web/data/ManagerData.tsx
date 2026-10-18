'use client';

// apps/web/data/ManagerData.tsx
//
// Loads the reports and the technicians ONCE for all manager pages (Dashboard,
// Reports, Technicians) and shares them, so moving between the pages does not load
// everything again and the "Reports" bubble in the menu always matches the lists.
// `reloadAll` asks for fresh lists, for example after an Assign.
// Owned by Mithi.

import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useReports, useTechnicians } from './useDashboardData';

type ManagerDataValue = {
  reports: ReturnType<typeof useReports>;
  technicians: ReturnType<typeof useTechnicians>;
  reloadAll: () => void;
};

const ManagerDataContext = createContext<ManagerDataValue | null>(null);

export function ManagerDataProvider({ children }: { children: ReactNode }) {
  const reports = useReports();
  const technicians = useTechnicians();

  const value = useMemo(
    () => ({
      reports,
      technicians,
      reloadAll: () => {
        void reports.reload();
        void technicians.reload();
      },
    }),
    [reports, technicians],
  );
  return <ManagerDataContext.Provider value={value}>{children}</ManagerDataContext.Provider>;
}

/** The shared reports and technicians for a manager page. */
export function useManagerData(): ManagerDataValue {
  const value = useContext(ManagerDataContext);
  if (!value) throw new Error('useManagerData must be used inside <ManagerDataProvider>');
  return value;
}
