'use client';

// apps/web/components/TechniciansPanel.tsx
//
// The "Technicians" card (like the design picture). Each technician is one row: a
// round avatar with their initials, their name, a small line under it, and the
// Free / Busy label on the right.
//   - small line for a BUSY technician: "On <machine>" (the machine of their open job)
//   - small line for a FREE technician: "Ready for a job"
// Free technicians come first, so the manager sees who can take a job.
// `detailed` (the Technicians page) adds a second small line: how many reports
// this technician has resolved. Without it (the Dashboard) the card is compact and
// has a link to the Technicians page. Owned by Mithi.

import Link from 'next/link';
import type { Language, Report, Technician } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';
import { localizeDigits } from '../language/format';
import { screenText } from '../language/screenText';
import { Card } from './Card';
import { AvailabilityLabel } from './StatusLabel';
import { machineName, personName } from '../language/localNames';

/**
 * The first letter of the first two words: "Tariq Hasan" gives "TH".
 * In Bangla only the first letter of the first name is used, because two Bangla letters side by
 * side read like one odd word.
 */
export function initialsOf(name: string, language: Language = 'en'): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, language === 'en' ? 2 : 1)
    .map((word) => Array.from(word)[0] ?? '')
    .join('')
    .toUpperCase();
}

type TechniciansPanelProps = {
  technicians: readonly Technician[];
  /** All reports, to find the machine each busy technician is working on. */
  reports: readonly Report[];
  detailed?: boolean;
};

export function TechniciansPanel({
  technicians,
  reports,
  detailed = false,
}: TechniciansPanelProps) {
  const { language } = useLanguage();

  // Free first, then busy. Inside each group, keep the order we were given.
  const sorted = [...technicians].sort(
    (a, b) => Number(b.availability === 'free') - Number(a.availability === 'free'),
  );

  function smallLine(technician: Technician): string {
    if (technician.availability === 'free') return screenText('techReady', language);
    const job = reports.find((r) => r.technician?.id === technician.id && r.status !== 'resolved');
    return job
      ? screenText('techOnJob', language).replace('{machine}', machineName(job.machine, language))
      : screenText('assignBusyTag', language);
  }

  function jobsDone(technician: Technician): string {
    const done = reports.filter(
      (r) => r.technician?.id === technician.id && r.status === 'resolved',
    ).length;
    return screenText('techJobsDone', language).replace(
      '{n}',
      localizeDigits(String(done), language),
    );
  }

  return (
    <Card className="card-list stitched">
      {detailed ? null : (
        <div className="card-head">
          <h2>{screenText('techniciansTitle', language)}</h2>
          <Link href="/manager/technicians" className="card-link">
            {screenText('viewAllTechnicians', language)}
          </Link>
        </div>
      )}
      <ul className="tech-list">
        {sorted.map((technician) => (
          <li key={technician.id} className="tech-row">
            <span className="avatar" aria-hidden="true">
              {initialsOf(personName(technician, language), language)}
            </span>
            <div className="tech-text">
              <div className="tech-name">{personName(technician, language)}</div>
              <div className="cell-sub">{smallLine(technician)}</div>
              {detailed ? <div className="cell-sub">{jobsDone(technician)}</div> : null}
            </div>
            <AvailabilityLabel availability={technician.availability} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
