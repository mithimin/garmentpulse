'use client';

// apps/web/components/ReportsCard.tsx
//
// The table of reports on the manager screens. It has two modes:
//   - mode "queue" (Dashboard): only the reports that need a technician (waiting,
//     nobody assigned), oldest first, because they have waited longest. Title
//     "Needs attention" and a link to the Reports page.
//   - mode "all" (Reports page): every report, with filter tabs (All, Waiting,
//     In progress, Resolved). The queue comes first, marked with a gold edge.
// Rows in the queue have an "Assign" button; all other rows have an "Open" button
// that shows read-only details. Owned by Mithi.

import { useState } from 'react';
import Link from 'next/link';
import type { Report, ReportStatus, Technician } from '@garmentpulse/shared';
import { isInQueue, STATUS_LABELS } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';
import { formatDateTime, localizeDigits } from '../language/format';
import { screenText } from '../language/screenText';
import { AssignDialog } from './AssignDialog';
import { Button } from './Button';
import { Card } from './Card';
import { DataTable } from './DataTable';
import { ReportDetailsDialog } from './ReportDetailsDialog';
import { EmptyMessage } from './StateMessage';
import { StatusLabel } from './StatusLabel';

type ReportsCardProps = {
  mode: 'queue' | 'all';
  reports: readonly Report[];
  technicians: readonly Technician[];
  /** Asks the page to reload its lists after an assign. */
  onAssigned: () => void;
};

type Filter = 'all' | ReportStatus;
const FILTERS: Filter[] = ['all', 'waiting', 'in_progress', 'resolved'];

/** Queue first (oldest first), then the rest (newest first). */
function orderForManager(reports: readonly Report[]): Report[] {
  const queue = reports.filter(isInQueue).sort((a, b) => a.created_at.localeCompare(b.created_at));
  const others = reports
    .filter((r) => !isInQueue(r))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return [...queue, ...others];
}

export function ReportsCard({ mode, reports, technicians, onAssigned }: ReportsCardProps) {
  const { language } = useLanguage();
  const [assigning, setAssigning] = useState<Report | null>(null);
  const [viewing, setViewing] = useState<Report | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const ordered = orderForManager(reports);
  const rows =
    mode === 'queue'
      ? ordered.filter(isInQueue)
      : ordered.filter((r) => filter === 'all' || r.status === filter);

  const countFor = (f: Filter) =>
    f === 'all' ? reports.length : reports.filter((r) => r.status === f).length;
  const filterLabel = (f: Filter) =>
    f === 'all' ? screenText('filterAll', language) : STATUS_LABELS[f][language];

  return (
    <Card className="card-list">
      {mode === 'queue' ? (
        <div className="card-head">
          <h2>{screenText('needsAttentionTitle', language)}</h2>
          <Link href="/manager/reports" className="card-link">
            {screenText('viewAllReports', language)}
          </Link>
        </div>
      ) : null}

      {mode === 'all' ? (
        <div className="filter-tabs" role="group" aria-label={screenText('filterName', language)}>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={f === filter ? 'filter-tab filter-tab-active' : 'filter-tab'}
              aria-pressed={f === filter}
              onClick={() => setFilter(f)}
            >
              {filterLabel(f)} {localizeDigits(String(countFor(f)), language)}
            </button>
          ))}
        </div>
      ) : null}

      {rows.length === 0 ? (
        mode === 'queue' ? (
          <div className="state">
            <h3>{screenText('nothingNeedsAttention', language)}</h3>
            <p>{screenText('nothingNeedsAttentionText', language)}</p>
          </div>
        ) : (
          <EmptyMessage />
        )
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th>{screenText('colMachine', language)}</th>
              <th>{screenText('colProblem', language)}</th>
              <th>{screenText('colReportedBy', language)}</th>
              <th>{screenText('colTechnician', language)}</th>
              <th>{screenText('colStatus', language)}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((report) => {
              const needsTechnician = isInQueue(report);
              return (
                <tr key={report.id} className={needsTechnician ? 'row-attention' : undefined}>
                  <td>
                    <strong>{report.machine.name}</strong>
                  </td>
                  <td>{report.description}</td>
                  <td>
                    {report.reported_by.display_name}
                    <div className="cell-sub nowrap">
                      {formatDateTime(report.created_at, language)}
                    </div>
                  </td>
                  <td>
                    {report.technician
                      ? report.technician.display_name
                      : needsTechnician
                        ? screenText('inQueue', language)
                        : '-'}
                  </td>
                  <td>
                    <StatusLabel status={report.status} />
                  </td>
                  <td className="actions">
                    {needsTechnician ? (
                      <Button small onClick={() => setAssigning(report)}>
                        {screenText('assignButton', language)}
                      </Button>
                    ) : (
                      <Button small onClick={() => setViewing(report)}>
                        {screenText('openButton', language)}
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      )}

      {assigning ? (
        <AssignDialog
          report={assigning}
          technicians={technicians}
          onClose={() => setAssigning(null)}
          onAssigned={onAssigned}
        />
      ) : null}
      {viewing ? <ReportDetailsDialog report={viewing} onClose={() => setViewing(null)} /> : null}
    </Card>
  );
}
