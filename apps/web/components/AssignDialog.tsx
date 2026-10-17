'use client';

// apps/web/components/AssignDialog.tsx
//
// The small pop-up box that opens when the manager presses "Assign" on a report.
// It lists the technicians: FREE ones can be chosen, BUSY ones are greyed out
// (a technician may only have one unfinished job, docs/api-contract.md 4.4).
// If nobody is free it says the report stays in the queue. Choosing a technician
// calls `assignTechnician`; a failure becomes a friendly sentence. The box closes
// with the Cancel button, the Escape key, or a click on the dark area around it.
// Owned by Mithi.

import { useEffect, useState } from 'react';
import type { Report, Technician } from '@garmentpulse/shared';
import { assignTechnician } from '../data/useDashboardData';
import { useLanguage } from '../language/LanguageContext';
import { errorSentence } from '../language/errorText';
import { screenText } from '../language/screenText';
import { AvailabilityLabel } from './StatusLabel';
import { Button } from './Button';

type AssignDialogProps = {
  report: Report;
  technicians: readonly Technician[];
  onClose: () => void;
  /** Called after a successful assign, so the page can refresh its lists. */
  onAssigned: () => void;
};

export function AssignDialog({ report, technicians, onClose, onAssigned }: AssignDialogProps) {
  const { language } = useLanguage();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const anyFree = technicians.some((t) => t.availability === 'free');

  async function choose(technician: Technician) {
    setBusyId(technician.id);
    setErrorText('');
    try {
      await assignTechnician(report.id, technician.id);
      onAssigned();
      onClose();
    } catch (error) {
      setErrorText(errorSentence(error, language));
      setBusyId(null);
      // The lists may be out of date (someone else assigned first), so refresh them.
      onAssigned();
    }
  }

  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label={screenText('assignTitle', language)}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2>{screenText('assignTitle', language)}</h2>
        <p className="dialog-sub">
          {screenText('assignFor', language).replace('{machine}', report.machine.name)}
        </p>

        <ul className="dialog-list">
          {technicians.map((technician) => {
            const free = technician.availability === 'free';
            return (
              <li key={technician.id}>
                <button
                  type="button"
                  className="dialog-choice"
                  disabled={!free || busyId !== null}
                  onClick={() => void choose(technician)}
                >
                  <span className="dialog-choice-name">{technician.display_name}</span>
                  {busyId === technician.id ? (
                    <span>{screenText('assigning', language)}</span>
                  ) : (
                    <AvailabilityLabel availability={technician.availability} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {!anyFree ? <p className="dialog-note">{screenText('assignNoFree', language)}</p> : null}
        {errorText ? (
          <p className="field-error" role="alert">
            {errorText}
          </p>
        ) : null}

        <div className="dialog-actions">
          <Button onClick={onClose}>{screenText('cancel', language)}</Button>
        </div>
      </div>
    </div>
  );
}
