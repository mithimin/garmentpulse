'use client';

// apps/web/app/owner/page.tsx
//
// The owner's Reports page (docs/mvp.md 2.5). It is READ-ONLY. From the top it has:
//   - a greeting ("Have a good day, Mr. Rahman") with today's date and a short line,
//   - three count boxes: Waiting, In progress, Resolved, each with a small tag
//     (data/stats.ts says how the tags are worked out),
//   - a "Reports" card with every report and filter tabs. There is no Assign
//     button, and "Open" only shows details.
// The role door, the top bar and the sidebar come from app/owner/layout.tsx; the
// second owner page, "Manager codes", is app/owner/codes/page.tsx.
// Data comes from the real backend when it is connected (lib/backend.ts),
// otherwise from the fake data, and updates live.
// Owned by Mithi.

import { isInQueue, STATUS_LABELS } from '@garmentpulse/shared';
import { useAuth } from '../../auth/AuthContext';
import { CountBox } from '../../components/CountBox';
import { DataGate } from '../../components/DataGate';
import { ReportsCard } from '../../components/ReportsCard';
import { averageFixMs, formatDuration, resolvedToday, startedInLastHour } from '../../data/stats';
import { useOwnerSummary, useReports } from '../../data/useDashboardData';
import { formatToday } from '../../language/greeting';
import { useLanguage } from '../../language/LanguageContext';
import { localizeDigits } from '../../language/format';
import { screenText } from '../../language/screenText';
import { personName } from '../../language/localNames';

export default function OwnerPage() {
  const { profile } = useAuth();
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
  const name = profile ? personName(profile, language) : '';

  return (
    <>
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
    </>
  );
}
