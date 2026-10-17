'use client';

// apps/web/components/StatusLabel.tsx
//
// The small woven-label look for a report status (Waiting, In progress,
// Resolved) and for a technician's availability (Free, Busy). The words come
// from the shared word list, in the chosen language. A colour never stands
// alone: the word is always shown (design system section 4.4).
// Owned by Mithi.

import type { ReportStatus, TechnicianAvailability } from '@garmentpulse/shared';
import { AVAILABILITY_LABELS, STATUS_LABELS } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';

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
