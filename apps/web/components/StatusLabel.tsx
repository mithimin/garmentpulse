'use client';

// apps/web/components/StatusLabel.tsx
//
// The small woven-label look for a report status (Waiting, In progress,
// Resolved), for a technician's availability (Free, Busy) and for a repair cost
// (Waiting, Approved, Rejected). The words come from the shared word list, in the
// chosen language. A colour never stands alone: the word is always shown (design
// system section 4.4).
// Owned by Mithi.

import type { ExpenseStatus, ReportStatus, TechnicianAvailability } from '@garmentpulse/shared';
import { AVAILABILITY_LABELS, EXPENSE_STATUS_LABELS, STATUS_LABELS } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';

/** Which colours each cost status borrows (design system section 4.2). */
const EXPENSE_COLOURS: Record<ExpenseStatus, string> = {
  waiting: 'status-waiting',
  approved: 'status-resolved',
  rejected: 'status-rejected',
};

export function ExpenseStatusLabel({ status }: { status: ExpenseStatus }) {
  const { language } = useLanguage();
  return (
    <span className={`status ${EXPENSE_COLOURS[status]}`}>
      {EXPENSE_STATUS_LABELS[status][language]}
    </span>
  );
}

export function StatusLabel({ status }: { status: ReportStatus }) {
  const { language } = useLanguage();
  return <span className={`status status-${status}`}>{STATUS_LABELS[status][language]}</span>;
}

export function AvailabilityLabel({ availability }: { availability: TechnicianAvailability }) {
  const { language } = useLanguage();
  return (
    <span className={`status status-${availability}`}>
      {AVAILABILITY_LABELS[availability][language]}
    </span>
  );
}
