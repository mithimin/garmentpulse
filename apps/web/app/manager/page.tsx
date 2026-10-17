'use client';

// apps/web/app/manager/page.tsx
//
// The manager's start page: three count boxes (Waiting, In progress, Resolved),
// the list of all reports, and the technicians with free / busy next to each name.
// The data comes from the real backend when it is connected (lib/backend.ts), and
// from the fake data otherwise. It updates live. The "Assign" button comes in the
// next piece of work. Owned by Mithi.

import { STATUS_LABELS, summarizeReports } from '@garmentpulse/shared';
import { RoleGate } from '../../auth/RoleGate';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/Card';
import { CountBox } from '../../components/CountBox';
import { DataGate } from '../../components/DataGate';
import { ReportsTable } from '../../components/ReportsTable';
import { AvailabilityLabel } from '../../components/StatusLabel';
import { TopBar } from '../../components/TopBar';
import { useReports, useTechnicians } from '../../data/useDashboardData';
import { useLanguage } from '../../language/LanguageContext';
import { screenText } from '../../language/screenText';

export default function ManagerPage() {
  return (
    <RoleGate role="manager">
      <ManagerContent />
    </RoleGate>
  );
}

function ManagerContent() {
  const { logOut } = useAuth();
  const { language } = useLanguage();
  const reports = useReports();
  const technicians = useTechnicians();
  const summary = summarizeReports(reports.data ?? []);

  return (
    <>
      <TopBar role="manager" onLogOut={logOut} />
      <main className="page">
        <div className="grid-cards">
          <CountBox label={STATUS_LABELS.waiting[language]} count={summary.waiting} />
          <CountBox label={STATUS_LABELS.in_progress[language]} count={summary.in_progress} />
          <CountBox label={STATUS_LABELS.resolved[language]} count={summary.resolved} />
        </div>

        <Card>
          <h2>{screenText('reportsTitle', language)}</h2>
          <DataGate state={reports}>{(list) => <ReportsTable reports={list} />}</DataGate>
        </Card>

        <Card>
          <h2>{screenText('techniciansTitle', language)}</h2>
          <DataGate state={technicians}>
            {(list) =>
              list.map((tech) => (
                <p key={tech.id}>
                  {tech.display_name} <AvailabilityLabel availability={tech.availability} />
                </p>
              ))
            }
          </DataGate>
        </Card>
      </main>
    </>
  );
}
