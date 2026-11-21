// apps/mobile/src/language/repairTime.ts
//
// How long a repair took, as text like "25 min": the time from when the technician
// accepted the job until it was marked fixed. It is worked out from two times the
// backend already sends (`accepted_at` and `updated_at`), so the backend has nothing
// new to do. It returns an empty text when the job is not finished or a time is
// missing. (A resolved job is never changed again, so `updated_at` is the time it
// was fixed.)
// Owned by Rubaiya.

import type { Language, Report } from '@garmentpulse/shared';
import { formatDuration } from './format';

export function repairTime(job: Report, language: Language): string {
  if (job.status !== 'resolved' || !job.accepted_at) return '';
  const took = Date.parse(job.updated_at) - Date.parse(job.accepted_at);
  if (Number.isNaN(took) || took < 0) return '';
  return formatDuration(took, language);
}
