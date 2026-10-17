'use client';

// apps/web/components/ReportDetailsDialog.tsx
//
// The pop-up that opens with the "Open" button on a report row. It only SHOWS the
// report (read-only): machine, problem, who reported it, the technician, the
// status and the times. Owned by Mithi.

import type { Report } from '@garmentpulse/shared';
import { isInQueue } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';
import { formatDateTime } from '../language/format';
import { screenText } from '../language/screenText';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { StatusLabel } from './StatusLabel';

export function ReportDetailsDialog({ report, onClose }: { report: Report; onClose: () => void }) {
  const { language } = useLanguage();
  const technician = report.technician
    ? report.technician.display_name
    : isInQueue(report)
      ? screenText('inQueue', language)
      : '-';

  return (
    <Dialog label={screenText('detailsTitle', language)} onClose={onClose}>
      <h2>{report.machine.name}</h2>
      <dl className="details">
        <dt>{screenText('colProblem', language)}</dt>
        <dd>{report.description}</dd>
        <dt>{screenText('colReportedBy', language)}</dt>
        <dd>{report.reported_by.display_name}</dd>
        <dt>{screenText('colTechnician', language)}</dt>
        <dd>{technician}</dd>
        <dt>{screenText('colStatus', language)}</dt>
        <dd>
          <StatusLabel status={report.status} />
        </dd>
        <dt>{screenText('colReported', language)}</dt>
        <dd>{formatDateTime(report.created_at, language)}</dd>
        <dt>{screenText('colLastChange', language)}</dt>
        <dd>{formatDateTime(report.updated_at, language)}</dd>
      </dl>
      <div className="dialog-actions">
        <Button onClick={onClose}>{screenText('close', language)}</Button>
      </div>
    </Dialog>
  );
}
