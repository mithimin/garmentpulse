'use client';

// apps/web/components/ManagerMachineMap.tsx
//
// THE one Machine map of the manager website. The Dashboard (`/manager`) and the Machines
// page (`/manager/machines`) both show THIS component, so the two can never look different:
// the same machines, the same rows, the same heading strip, the same seats.
// It loads the machines, reports and technicians itself (shared copy of the data from
// data/ManagerData.tsx). Machines are shown on floors of 3 rows with 5 machines each, with
// floor tabs and a live count per floor (see components/MachineMap.tsx). Owned by Mithi.

import { DataGate } from './DataGate';
import { MachineMap } from './MachineMap';
import { buildSeats } from '../data/machineSeats';
import { useManagerData } from '../data/ManagerData';
import { useMachines } from '../data/useDashboardData';
import { useLanguage } from '../language/LanguageContext';
import { screenText } from '../language/screenText';

export function ManagerMachineMap() {
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
                />
              )}
            </DataGate>
          )}
        </DataGate>
      )}
    </DataGate>
  );
}
