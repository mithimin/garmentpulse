'use client';

// apps/web/app/manager/machines/page.tsx
//
// The manager's MACHINES page: the Machine map (components/MachineMap.tsx). Every machine
// is a small sewing machine on a seat plan; a broken one flashes red and beeps, and the
// manager picks it and assigns a free technician. It loads the machines itself, so the
// other manager pages are not changed. The top bar and the menu come from
// app/manager/layout.tsx. Owned by Mithi.

import { DataGate } from '../../../components/DataGate';
import { MachineMap } from '../../../components/MachineMap';
import { buildSeats } from '../../../data/machineSeats';
import { useManagerData } from '../../../data/ManagerData';
import { useMachines } from '../../../data/useDashboardData';
import { useLanguage } from '../../../language/LanguageContext';
import { screenText } from '../../../language/screenText';

export default function MachinesPage() {
  const { language } = useLanguage();
  const { reports, technicians, reloadAll } = useManagerData();
  const machines = useMachines();

  return (
    <>
      <div className="greeting">
        <h1>{screenText('mapTitle', language)}</h1>
        <p className="greeting-line">{screenText('mapSub', language)}</p>
      </div>
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
                  />
                )}
              </DataGate>
            )}
          </DataGate>
        )}
      </DataGate>
    </>
  );
}
