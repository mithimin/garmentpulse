'use client';

// apps/web/app/owner/page.tsx
//
// The owner's page: ONE read-only screen with three count boxes on top
// (Waiting, In progress, Resolved) and a list of all reports. The owner cannot
// change anything here (docs/mvp.md 2.5). Data comes from the real backend when it
// is connected (lib/backend.ts), otherwise from the fake data, and updates live.
// While the backend is still fake, a "Manager codes" box lets the owner create
// one-time codes for new managers (see auth/fakeAccounts.ts); it is hidden when the
// real backend is on, because the real backend has no sign-up yet.
// Owned by Mithi.

import { useEffect, useState } from 'react';
import { STATUS_LABELS } from '@garmentpulse/shared';
import { RoleGate } from '../../auth/RoleGate';
import { useAuth } from '../../auth/AuthContext';
import { createManagerCode, listManagerCodes } from '../../auth/fakeAccounts';
import type { ManagerCode } from '../../auth/fakeAccounts';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { CountBox } from '../../components/CountBox';
import { DataGate } from '../../components/DataGate';
import { ReportsTable } from '../../components/ReportsTable';
import { TopBar } from '../../components/TopBar';
import { useOwnerSummary, useReports } from '../../data/useDashboardData';
import { useLanguage } from '../../language/LanguageContext';
import { screenText } from '../../language/screenText';
import { backendIsReal } from '../../lib/backend';

export default function OwnerPage() {
  return (
    <RoleGate role="owner">
      <OwnerContent />
    </RoleGate>
  );
}

function OwnerContent() {
  const { logOut } = useAuth();
  const { language } = useLanguage();
  const summary = useOwnerSummary();
  const reports = useReports();

  return (
    <>
      <TopBar role="owner" onLogOut={logOut} />
      <main className="page">
        <DataGate state={summary}>
          {(counts) => (
            <div className="count-grid">
              <CountBox label={STATUS_LABELS.waiting[language]} count={counts.waiting} />
              <CountBox label={STATUS_LABELS.in_progress[language]} count={counts.in_progress} />
              <CountBox label={STATUS_LABELS.resolved[language]} count={counts.resolved} />
            </div>
          )}
        </DataGate>

        <Card>
          <h2>{screenText('reportsTitle', language)}</h2>
          <DataGate state={reports}>{(list) => <ReportsTable reports={list} />}</DataGate>
        </Card>

        {backendIsReal ? null : <ManagerCodesCard />}
      </main>
    </>
  );
}

/** FAKE-mode only: the owner makes one-time codes that new managers need to sign up. */
function ManagerCodesCard() {
  const { language } = useLanguage();
  const [codes, setCodes] = useState<ManagerCode[]>([]);

  // Read the saved codes once the page is in the browser.
  useEffect(() => {
    setCodes(listManagerCodes());
  }, []);

  function handleCreateCode() {
    createManagerCode();
    setCodes(listManagerCodes());
  }

  return (
    <Card>
      <h2>{screenText('codesTitle', language)}</h2>
      <p>{screenText('codesHelp', language)}</p>
      <Button kind="main" onClick={handleCreateCode}>
        {screenText('createCode', language)}
      </Button>
      {codes.length === 0 ? (
        <p>{screenText('noCodes', language)}</p>
      ) : (
        <ul className="code-list">
          {codes.map((item) => (
            <li key={item.code} className="code">
              {item.code}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
