'use client';

// apps/web/app/owner/page.tsx
//
// The owner's page: ONE read-only screen (docs/mvp.md 2.5). From the top it has:
//   - a greeting ("Good morning, Mr. Rahman") with today's date and a short line,
//   - three count boxes: Waiting, In progress, Resolved, each with a small tag
//     (data/stats.ts says how the tags are worked out),
//   - a "Reports" card with every report and filter tabs. It is READ-ONLY: there is
//     no Assign button, and "Open" only shows details.
// There is no menu and no sidebar. The owner cannot change anything here.
// Data comes from the real backend when it is connected (lib/backend.ts),
// otherwise from the fake data, and updates live.
// While the backend is still fake, a "Manager codes" card lets the owner create
// one-time codes for new managers (see auth/fakeAccounts.ts); it is hidden when the
// real backend is on, because the real backend has no sign-up yet.
// Owned by Mithi.

import { useEffect, useState } from 'react';
import { isInQueue, STATUS_LABELS } from '@garmentpulse/shared';
import { RoleGate } from '../../auth/RoleGate';
import { useAuth } from '../../auth/AuthContext';
import { createInviteCode, listInviteCodes } from '../../auth/fakeAccounts';
import type { InviteCode } from '../../auth/fakeAccounts';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { CountBox } from '../../components/CountBox';
import { DataGate } from '../../components/DataGate';
import { ReportsCard } from '../../components/ReportsCard';
import { TopBar } from '../../components/TopBar';
import { averageFixMs, formatDuration, resolvedToday, startedInLastHour } from '../../data/stats';
import { useOwnerSummary, useReports } from '../../data/useDashboardData';
import { formatToday } from '../../language/greeting';
import { useLanguage } from '../../language/LanguageContext';
import { localizeDigits } from '../../language/format';
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
  const { profile, logOut } = useAuth();
  const { language } = useLanguage();
  const summary = useOwnerSummary();
  const reports = useReports();

  const now = new Date();
  const list = reports.data ?? [];
  const resolvedList = resolvedToday(list, now);
  const averageFix = averageFixMs(resolvedList);
  const queueCount = list.filter(isInQueue).length;

  /** Puts numbers into a sentence like "{n} waiting", in the right digits. */
  const fill = (text: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce(
      (result, [key, value]) => result.replace(`{${key}}`, localizeDigits(String(value), language)),
      text,
    );

  // "Mr. Rahman" is a title and a name, so the owner is greeted by the full name.
  const name = profile?.display_name ?? '';

  return (
    <>
      <TopBar role="owner" onLogOut={logOut} />
      <main className="page">
        <div className="greeting">
          <h1>
            <span className="greeting-hello">{screenText('greetDay', language)}</span>{' '}
            <span className="greeting-name">{name}</span>
          </h1>
          <p className="greeting-line">
            {formatToday(now, language)}
            {summary.data
              ? ` · ${fill(screenText('ownerLine', language), {
                  waiting: summary.data.waiting,
                  progress: summary.data.in_progress,
                })}`
              : ''}
          </p>
        </div>

        <DataGate state={summary}>
          {(counts) => (
            <div className="count-grid count-grid-three">
              <CountBox
                label={STATUS_LABELS.waiting[language]}
                count={counts.waiting}
                tone="waiting"
                tag={
                  queueCount === 0
                    ? screenText('tagNobodyWaiting', language)
                    : fill(screenText('tagNeedTechnician', language), { n: queueCount })
                }
              />
              <CountBox
                label={STATUS_LABELS.in_progress[language]}
                count={counts.in_progress}
                tone="progress"
                tag={fill(screenText('tagStartedHour', language), {
                  n: startedInLastHour(list, now),
                })}
              />
              <CountBox
                label={STATUS_LABELS.resolved[language]}
                count={counts.resolved}
                tone="resolved"
                tag={
                  averageFix === null
                    ? screenText('tagNoneToday', language)
                    : fill(screenText('tagResolvedToday', language), {
                        n: resolvedList.length,
                        t: formatDuration(averageFix, language),
                      })
                }
              />
            </div>
          )}
        </DataGate>

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

        {backendIsReal ? null : <ManagerCodesCard />}
      </main>
    </>
  );
}

/** FAKE-mode only: the owner makes one-time codes that new managers need to sign up. */
function ManagerCodesCard() {
  const { language } = useLanguage();
  const [codes, setCodes] = useState<InviteCode[]>([]);

  // Read the saved codes once the page is in the browser.
  useEffect(() => {
    setCodes(listInviteCodes());
  }, []);

  function handleCreateCode() {
    createInviteCode('manager');
    setCodes(listInviteCodes());
  }

  return (
    <Card className="card-list">
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
