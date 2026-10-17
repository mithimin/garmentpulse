'use client';

// apps/web/components/TechniciansPanel.tsx
//
// The "Technicians" card on the manager screen (like the design picture). Each
// technician is one row: a round avatar with their initials, their name, a small
// line under it, and the Free / Busy label on the right.
//   - small line for a BUSY technician: "On <machine>" (the machine of their open job)
//   - small line for a FREE technician: "Ready for a job"
// Free technicians come first, so the manager sees who can take a job.
// Owned by Mithi.

import type { Report, Technician } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';
import { screenText } from '../language/screenText';
import { Card } from './Card';
import { AvailabilityLabel } from './StatusLabel';

/** The first letter of the first two words: "Tariq Hasan" gives "TH". */
export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? '')
    .join('')
    .toUpperCase();
}

type TechniciansPanelProps = {
  technicians: readonly Technician[];
  /** All reports, to find the machine each busy technician is working on. */
  reports: readonly Report[];
};

export function TechniciansPanel({ technicians, reports }: TechniciansPanelProps) {
  const { language } = useLanguage();

  // Free first, then busy. Inside each group, keep the order we were given.
  const sorted = [...technicians].sort(
    (a, b) => Number(b.availability === 'free') - Number(a.availability === 'free'),
  );

  function smallLine(technician: Technician): string {
    if (technician.availability === 'free') return screenText('techReady', language);
    const job = reports.find((r) => r.technician?.id === technician.id && r.status !== 'resolved');
    return job
      ? screenText('techOnJob', language).replace('{machine}', job.machine.name)
      : screenText('assignBusyTag', language);
  }

  return (
    <Card id="technicians">
      <h2>{screenText('techniciansTitle', language)}</h2>
      <ul className="tech-list">
        {sorted.map((technician) => (
          <li key={technician.id} className="tech-row">
            <span className="avatar" aria-hidden="true">
              {initialsOf(technician.display_name)}
            </span>
            <div className="tech-text">
              <div className="tech-name">{technician.display_name}</div>
              <div className="cell-sub">{smallLine(technician)}</div>
            </div>
            <AvailabilityLabel availability={technician.availability} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
