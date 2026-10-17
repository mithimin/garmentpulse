'use client';

// apps/web/app/manager/page.tsx
//
// The manager's DASHBOARD (the start page). From the top it has:
//   - a greeting ("Good morning, Farhan") with today's date and how many reports
//     are waiting for a technician (the queue),
//   - four count boxes: New reports, In progress, Resolved today, Free technicians
//     (data/stats.ts says how they are worked out),
//   - "Needs attention": only the queue, with an Assign button, and a compact
//     technicians panel. The full lists are on the Reports and Technicians pages.
// The top bar and the role door come from app/manager/layout.tsx.
// Owned by Mithi.

import { isInQueue, STATUS_LABELS, summarizeReports } from '@garmentpulse/shared';
import { useAuth } from '../../auth/AuthContext';
import { CountBox } from '../../components/CountBox';
import { DataGate } from '../../components/DataGate';
import { ReportsCard } from '../../components/ReportsCard';
import { TechniciansPanel } from '../../components/TechniciansPanel';
import { useManagerData } from '../../data/ManagerData';
import {
  averageFixMs,
  countFree,
  formatDuration,
  resolvedToday,
  startedInLastHour,
} from '../../data/stats';
import { formatToday, greetingKey } from '../../language/greeting';
import { useLanguage } from '../../language/LanguageContext';
import { localizeDigits } from '../../language/format';
import { screenText } from '../../language/screenText';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const { reports, technicians, reloadAll } = useManagerData();
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
  const queueText =
    queueCount === 0
      ? screenText('queueNone', language)
      : queueCount === 1
        ? screenText('queueOne', language)
        : fill(screenText('queueMany', language), { n: queueCount });

  return (
    <>
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
          tag={fill(screenText('tagStartedHour', language), { n: startedInLastHour(list, now) })}
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
                  <ReportsCard
                    mode="queue"
                    reports={rows}
                    technicians={people}
                    onAssigned={reloadAll}
                  />
                  <TechniciansPanel technicians={people} reports={rows} />
                </>
              )}
            </DataGate>
          )}
        </DataGate>
      </div>
    </>
  );
}
