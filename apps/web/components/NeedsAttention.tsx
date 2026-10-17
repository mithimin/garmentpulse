'use client';

// apps/web/components/NeedsAttention.tsx
//
// The "Needs attention" card on the manager screen (like the design picture):
// the reports that are IN THE QUEUE (waiting, no technician yet), oldest first,
// because they have waited longest. Each row has an "Assign" button that opens
// the AssignDialog. The "View all reports" link scrolls to the full list below.
// When the queue is empty it says so in a friendly way. Owned by Mithi.

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
import { StatusLabel } from './StatusLabel';

type NeedsAttentionProps = {
  reports: readonly Report[];
  technicians: readonly Technician[];
  /** Asks the page to reload its lists after an assign. */
  onAssigned: () => void;
};

export function NeedsAttention({ reports, technicians, onAssigned }: NeedsAttentionProps) {
  const { language } = useLanguage();
  const [assigning, setAssigning] = useState<Report | null>(null);

  const queue = reports.filter(isInQueue).sort((a, b) => a.created_at.localeCompare(b.created_at));

  return (
    <Card className="card-list">
      <div className="card-head">
        <h2>{screenText('needsAttentionTitle', language)}</h2>
        <a href="#reports" className="card-link">
          {screenText('viewAllReports', language)}
        </a>
      </div>

      {queue.length === 0 ? (
        <div className="state">
          <h3>{screenText('nothingNeedsAttention', language)}</h3>
          <p>{screenText('nothingNeedsAttentionText', language)}</p>
        </div>
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th>{screenText('colMachine', language)}</th>
              <th>{screenText('colProblem', language)}</th>
              <th>{screenText('colReportedBy', language)}</th>
              <th>{screenText('colStatus', language)}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {queue.map((report) => (
              <tr key={report.id}>
                <td>
                  <strong>{report.machine.name}</strong>
                </td>
                <td>{report.description}</td>
                <td>
                  {report.reported_by.display_name}
                  <div className="cell-sub">{formatDateTime(report.created_at, language)}</div>
                </td>
                <td>
                  <StatusLabel status={report.status} />
                </td>
                <td className="actions">
                  <Button small onClick={() => setAssigning(report)}>
                    {screenText('assignButton', language)}
                  </Button>
                </td>
              </tr>
            ))}
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
    </Card>
  );
}
