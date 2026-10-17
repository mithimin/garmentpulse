'use client';

// apps/web/app/manager/page.tsx
//
// The manager's start page. From the top it has:
//   - the denim top bar with a menu (Dashboard, Reports, Technicians) that scrolls
//     to a part of this same page (the MVP has one manager screen),
//   - a greeting ("Good morning, Farhan") with today's date and how many reports
//     are waiting for a technician (the queue),
//   - three count boxes, the list of all reports, and the technicians with
//     free / busy.
// The four count boxes at the top are New reports, In progress, Resolved today and
// Free technicians, each with a small tag (see data/stats.ts for how they are
// worked out).
// The data comes from the real backend when it is connected (lib/backend.ts), and
// from the fake data otherwise. It updates live. The "Assign" button comes in a
// later step. Owned by Mithi.

import { LayoutDashboard, Users, Wrench } from 'lucide-react';
import { isInQueue, STATUS_LABELS, summarizeReports } from '@garmentpulse/shared';
import type { Language } from '@garmentpulse/shared';
import { RoleGate } from '../../auth/RoleGate';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/Card';
import { CountBox } from '../../components/CountBox';
import { DataGate } from '../../components/DataGate';
import { NeedsAttention } from '../../components/NeedsAttention';
import { ReportsTable } from '../../components/ReportsTable';
import { TechniciansPanel } from '../../components/TechniciansPanel';
import { TopBar } from '../../components/TopBar';
import type { MenuItem } from '../../components/TopBar';
import { useReports, useTechnicians } from '../../data/useDashboardData';
import {
  averageFixMs,
  countFree,
  formatDuration,
  resolvedToday,
  startedInLastHour,
} from '../../data/stats';
import { useLanguage } from '../../language/LanguageContext';
import { localizeDigits } from '../../language/format';
import { screenText } from '../../language/screenText';

export default function ManagerPage() {
  return (
    <RoleGate role="manager">
      <ManagerContent />
    </RoleGate>
  );
}

/** "Good morning", "Good afternoon" or "Good evening", from the clock. */
function greetingKey(now: Date) {
  const hour = now.getHours();
  if (hour < 12) return 'greetMorning';
  if (hour < 18) return 'greetAfternoon';
  return 'greetEvening';
}

/** "Friday 9 October" (or the Bangla version). */
function formatToday(now: Date, language: Language): string {
  const text = new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);
  return localizeDigits(text, language);
}

function ManagerContent() {
  const { profile, logOut } = useAuth();
  const { language } = useLanguage();
  const reports = useReports();
  const technicians = useTechnicians();
  const list = reports.data ?? [];
  const summary = summarizeReports(list);
  const queueCount = list.filter(isInQueue).length;

  const now = new Date();
  const firstName = profile?.display_name.split(' ')[0] ?? '';
  const technicianList = technicians.data ?? [];
  const resolvedList = resolvedToday(list, now);
  const averageFix = averageFixMs(resolvedList);
  const freeCount = countFree(technicianList);

  /** Puts numbers into a sentence like "{n} waiting", in the right digits. */
  const fill = (text: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce(
      (result, [key, value]) => result.replace(`{${key}}`, localizeDigits(String(value), language)),
      text,
    );
  /** After an assign, ask for fresh lists so every number and row is up to date. */
  const reloadAll = () => {
    void reports.reload();
    void technicians.reload();
  };
  const queueText =
    queueCount === 0
      ? screenText('queueNone', language)
      : queueCount === 1
        ? screenText('queueOne', language)
        : screenText('queueMany', language).replace(
            '{n}',
            localizeDigits(String(queueCount), language),
          );

  const menu: MenuItem[] = [
    {
      label: screenText('menuDashboard', language),
      href: '#top',
      icon: <LayoutDashboard size={18} strokeWidth={1.8} aria-hidden="true" />,
      active: true,
    },
    {
      label: screenText('menuReports', language),
      href: '#reports',
      icon: <Wrench size={18} strokeWidth={1.8} aria-hidden="true" />,
      count: queueCount,
    },
    {
      label: screenText('menuTechnicians', language),
      href: '#technicians',
      icon: <Users size={18} strokeWidth={1.8} aria-hidden="true" />,
    },
  ];

  return (
    <>
      <TopBar role="manager" menu={menu} onLogOut={logOut} />
      <main className="page" id="top">
        <div className="greeting">
          <h1>
            {screenText(greetingKey(now), language)}, {firstName}
          </h1>
          <p className="greeting-line">
            {formatToday(now, language)} · {queueText}
          </p>
        </div>

        <div className="count-grid">
          <CountBox
            label={screenText('labelNewReports', language)}
            count={summary.waiting}
            tag={
              queueCount === 0
                ? screenText('tagNobodyWaiting', language)
                : fill(screenText('tagNeedTechnician', language), { n: queueCount })
            }
          />
          <CountBox
            label={STATUS_LABELS.in_progress[language]}
            count={summary.in_progress}
            tone="green"
            tag={fill(screenText('tagStartedHour', language), {
              n: startedInLastHour(list, now),
            })}
          />
          <CountBox
            label={screenText('labelResolvedToday', language)}
            count={resolvedList.length}
            tone="blue"
            tag={
              averageFix === null
                ? screenText('tagNoFixes', language)
                : screenText('tagAverageFix', language).replace(
                    '{t}',
                    formatDuration(averageFix, language),
                  )
            }
          />
          <CountBox
            label={screenText('labelFreeTechnicians', language)}
            count={freeCount}
            tone="green"
            tag={fill(screenText('tagBusyOf', language), {
              busy: technicianList.length - freeCount,
              total: technicianList.length,
            })}
          />
        </div>

        <div className="dashboard-grid">
          <DataGate state={reports}>
            {(rows) => (
              <DataGate state={technicians}>
                {(people) => (
                  <>
                    <NeedsAttention reports={rows} technicians={people} onAssigned={reloadAll} />
                    <TechniciansPanel technicians={people} reports={rows} />
                  </>
                )}
              </DataGate>
            )}
          </DataGate>
        </div>

        <Card id="reports">
          <h2>{screenText('reportsTitle', language)}</h2>
          <DataGate state={reports}>{(rows) => <ReportsTable reports={rows} />}</DataGate>
        </Card>
      </main>
    </>
  );
}
