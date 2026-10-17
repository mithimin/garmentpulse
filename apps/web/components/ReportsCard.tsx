'use client';

// apps/web/components/ReportsCard.tsx
//
// The big "Reports" card on the manager screen (like the design picture). It is
// ONE table with every report. Reports that need a technician (the queue:
// waiting, nobody assigned) come FIRST, oldest first because they have waited
// longest, marked with a gold edge and an "Assign" button. All other reports
// follow, newest first, with an "Open" button that shows their details.
// Owned by Mithi.

import { useState } from 'react';
import type { Report, Technician } from '@garmentpulse/shared';
import { isInQueue } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';
import { formatDateTime } from '../language/format';
import { screenText } from '../language/screenText';
import { AssignDialog } from './AssignDialog';
import { Button } from './Button';
import { Card } from './Card';
import { DataTable } from './DataTable';
import { ReportDetailsDialog } from './ReportDetailsDialog';
import { EmptyMessage } from './StateMessage';
import { StatusLabel } from './StatusLabel';

type ReportsCardProps = {
  reports: readonly Report[];
  technicians: readonly Technician[];
  /** Asks the page to reload its lists after an assign. */
  onAssigned: () => void;
};

/** Queue first (oldest first), then the rest (newest first). */
function orderForManager(reports: readonly Report[]): Report[] {
  const queue = reports.filter(isInQueue).sort((a, b) => a.created_at.localeCompare(b.created_at));
  const others = reports
    .filter((r) => !isInQueue(r))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return [...queue, ...others];
}

export function ReportsCard({ reports, technicians, onAssigned }: ReportsCardProps) {
  const { language } = useLanguage();
  const [assigning, setAssigning] = useState<Report | null>(null);
  const [viewing, setViewing] = useState<Report | null>(null);

  const rows = orderForManager(reports);

  return (
    <Card id="reports" className="card-list">
      <div className="card-head">
        <h2>{screenText('reportsCardTitle', language)}</h2>
      </div>

      {rows.length === 0 ? (
        <EmptyMessage />
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
                    <div className="cell-sub">{formatDateTime(report.created_at, language)}</div>
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
