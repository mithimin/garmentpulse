'use client';

// apps/web/app/manager/reports/page.tsx
//
// The manager's REPORTS page: a title, then the full table of every report with
// filter tabs (All, Waiting, In progress, Resolved). Reports that need a technician
// come first and have an Assign button. The top bar comes from
// app/manager/layout.tsx. Owned by Mithi.

import { DataGate } from '../../../components/DataGate';
import { ReportsCard } from '../../../components/ReportsCard';
import { useManagerData } from '../../../data/ManagerData';
import { useLanguage } from '../../../language/LanguageContext';
import { screenText } from '../../../language/screenText';

export default function ReportsPage() {
  const { language } = useLanguage();
  const { reports, technicians, reloadAll } = useManagerData();

  return (
    <>
      <div className="greeting">
        <h1>{screenText('reportsPageTitle', language)}</h1>
        <p className="greeting-line">{screenText('reportsPageSub', language)}</p>
      </div>
      <DataGate state={reports}>
        {(rows) => (
          <DataGate state={technicians}>
            {(people) => (
              <ReportsCard mode="all" reports={rows} technicians={people} onAssigned={reloadAll} />
            )}
          </DataGate>
        )}
      </DataGate>
    </>
  );
}
