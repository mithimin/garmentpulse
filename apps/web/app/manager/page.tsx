'use client';

// apps/web/app/manager/page.tsx
//
// The manager's start page: three count boxes (Waiting, In progress, Resolved),
// the list of all reports, and the technicians with free / busy next to each name.
// For now it reads the FAKE data from @garmentpulse/shared; the live data and the
// "Assign" button come in the next piece of work. Owned by Mithi.

import {
  FAKE_REPORTS,
  FAKE_TECHNICIANS,
  STATUS_LABELS,
  summarizeReports,
} from '@garmentpulse/shared';
import { RoleGate } from '../../auth/RoleGate';
import { useAuth } from '../../auth/AuthContext';
import { AvailabilityLabel } from '../../components/StatusLabel';
import { Card } from '../../components/Card';
import { CountBox } from '../../components/CountBox';
import { ReportsTable } from '../../components/ReportsTable';
import { TopBar } from '../../components/TopBar';
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
  const summary = summarizeReports(FAKE_REPORTS);

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
          <ReportsTable reports={FAKE_REPORTS} />
        </Card>

        <Card>
          <h2>{screenText('techniciansTitle', language)}</h2>
          {FAKE_TECHNICIANS.map((tech) => (
            <p key={tech.id}>
              {tech.display_name} <AvailabilityLabel availability={tech.availability} />
            </p>
          ))}
        </Card>
      </main>
    </>
  );
}
