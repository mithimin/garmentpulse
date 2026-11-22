'use client';

// apps/web/app/owner/reports/page.tsx
//
// The owner's Reports page (docs/mvp.md 2.5). It is READ-ONLY: a "Reports" card
// with every report and filter tabs. There is no Assign button, and "Open" only
// shows details. The count boxes live on the Dashboard page (app/owner/page.tsx).
// The role door, the top bar and the sidebar come from app/owner/layout.tsx.
// Data comes from the real backend when connected, otherwise fake data, and
// updates live.
// Owned by Mithi.

import { DataGate } from '../../../components/DataGate';
import { ReportsCard } from '../../../components/ReportsCard';
import { useReports } from '../../../data/useDashboardData';
import { useLanguage } from '../../../language/LanguageContext';
import { screenText } from '../../../language/screenText';

export default function OwnerReportsPage() {
  const { language } = useLanguage();
  const reports = useReports();

  return (
    <DataGate state={reports}>
      {(rows) => (
        <ReportsCard
          mode="all"
          readOnly
          reports={rows}
          title={screenText('reportsPageTitle', language)}
        />
      )}
    </DataGate>
  );
}
