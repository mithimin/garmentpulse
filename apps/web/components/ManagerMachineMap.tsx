'use client';

// apps/web/components/ManagerMachineMap.tsx
//
// THE one Machine map of the manager website. The Dashboard (`/manager`) and the Machines
// page (`/manager/machines`) both show THIS component, so the two can never look different:
// the same machines, the same rows, the same heading strip, the same seats.
// It loads the machines, reports and technicians itself (shared copy of the data from
// data/ManagerData.tsx) and shows the real machines only. The Dashboard passes `maxRows` to
// show just the first rows with a "View all" link; the Machines page shows every row. The
// information on the seats is always the same. Owned by Mithi.

import { DataGate } from './DataGate';
import { MachineMap } from './MachineMap';
import { buildSeats } from '../data/machineSeats';
import { useManagerData } from '../data/ManagerData';
import { useMachines } from '../data/useDashboardData';
import { useLanguage } from '../language/LanguageContext';
import { screenText } from '../language/screenText';

export function ManagerMachineMap({ maxRows }: { maxRows?: number }) {
  const { language } = useLanguage();
  const { reports, technicians, reloadAll } = useManagerData();
  const machines = useMachines();

  return (
    <DataGate state={machines}>
      {(machineList) => (
        <DataGate state={reports}>
          {(reportList) => (
            <DataGate state={technicians}>
              {(people) => (
                <MachineMap
                  seats={buildSeats(machineList, reportList)}
                  technicians={people}
                  onChanged={reloadAll}
                  title={screenText('mapTitle', language)}
                  maxRows={maxRows}
                />
              )}
            </DataGate>
          )}
        </DataGate>
      )}
    </DataGate>
  );
}
