'use client';

// apps/web/app/manager/technicians/page.tsx
//
// The manager's TECHNICIANS page: a title, then every technician with their
// avatar, free / busy label, the machine they are on, and how many reports they
// have resolved. The top bar comes from app/manager/layout.tsx. Owned by Mithi.

import { DataGate } from '../../../components/DataGate';
import { TechniciansPanel } from '../../../components/TechniciansPanel';
import { useManagerData } from '../../../data/ManagerData';
import { useLanguage } from '../../../language/LanguageContext';
import { screenText } from '../../../language/screenText';

export default function TechniciansPage() {
  const { language } = useLanguage();
  const { reports, technicians } = useManagerData();

  return (
    <>
      <div className="greeting">
        <h1>{screenText('techniciansPageTitle', language)}</h1>
        <p className="greeting-line">{screenText('techniciansPageSub', language)}</p>
      </div>
      <DataGate state={reports}>
        {(rows) => (
          <DataGate state={technicians}>
            {(people) => <TechniciansPanel technicians={people} reports={rows} detailed />}
          </DataGate>
        )}
      </DataGate>
    </>
  );
}
