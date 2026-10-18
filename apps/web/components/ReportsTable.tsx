'use client';

// apps/web/components/ReportsTable.tsx
//
// A table of reports: machine, problem, who reported it, which technician has it,
// status and when. A report with no technician is shown as "In the queue"
// (docs/api-contract.md 2.6). The manager screen and the owner screen both use
// it, so both look the same. It only shows data; it changes nothing.
// Owned by Mithi.

import type { ReactNode } from 'react';
import type { Report } from '@garmentpulse/shared';
import { isInQueue } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';
import { formatDateTime } from '../language/format';
import { screenText } from '../language/screenText';
import { DataTable } from './DataTable';
import { EmptyMessage } from './StateMessage';
import { StatusLabel } from './StatusLabel';

type ReportsTableProps = {
  reports: readonly Report[];
  /** Optional extra cell at the end of each row, for example an "Assign" button. */
  renderAction?: (report: Report) => ReactNode;
};

export function ReportsTable({ reports, renderAction }: ReportsTableProps) {
  const { language } = useLanguage();
  if (reports.length === 0) return <EmptyMessage />;

  return (
    <DataTable>
      <thead>
        <tr>
          <th>{screenText('colMachine', language)}</th>
          <th>{screenText('colProblem', language)}</th>
          <th>{screenText('colReportedBy', language)}</th>
          <th>{screenText('colTechnician', language)}</th>
          <th>{screenText('colStatus', language)}</th>
          <th>{screenText('colReported', language)}</th>
          {renderAction ? <th /> : null}
        </tr>
      </thead>
      <tbody>
        {reports.map((report) => (
          <tr key={report.id}>
            <td className="code">{report.machine.name}</td>
            <td>{report.description}</td>
            <td>{report.reported_by.display_name}</td>
            <td>
              {report.technician
                ? report.technician.display_name
                : isInQueue(report)
                  ? screenText('inQueue', language)
                  : '-'}
            </td>
            <td>
              <StatusLabel status={report.status} />
            </td>
            <td className="nowrap">{formatDateTime(report.created_at, language)}</td>
            {renderAction ? <td className="actions">{renderAction(report)}</td> : null}
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}
