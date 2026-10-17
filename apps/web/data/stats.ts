// apps/web/data/stats.ts
//
// Small sums for the count boxes on the manager screen. They only read the list of
// reports and technicians we already have, so they work with fake and real data.
//
// Careful: the backend has no "started at" time, so these use each report's
// `updated_at` (the last change) as the best guess:
//   - "started in the last hour" = still in progress, last changed within an hour;
//   - "resolved today"           = resolved, last changed today;
//   - "average time to fix"      = resolved today: last change minus created time.
// So they are close estimates, not exact. Owned by Mithi.

import type { Language, Report, Technician } from '@garmentpulse/shared';
import { localizeDigits } from '../language/format';

const HOUR_MS = 60 * 60 * 1000;

export function startedInLastHour(reports: readonly Report[], now: Date): number {
  return reports.filter(
    (r) =>
      r.status === 'in_progress' && now.getTime() - new Date(r.updated_at).getTime() <= HOUR_MS,
  ).length;
}

export function resolvedToday(reports: readonly Report[], now: Date): Report[] {
  return reports.filter(
    (r) => r.status === 'resolved' && new Date(r.updated_at).toDateString() === now.toDateString(),
  );
}

/** Average time between "reported" and "resolved", in milliseconds. Null if none. */
export function averageFixMs(resolved: readonly Report[]): number | null {
  if (resolved.length === 0) return null;
  const total = resolved.reduce(
    (sum, r) => sum + (new Date(r.updated_at).getTime() - new Date(r.created_at).getTime()),
    0,
  );
  return Math.max(0, total / resolved.length);
}

export function countFree(technicians: readonly Technician[]): number {
  return technicians.filter((t) => t.availability === 'free').length;
}

/** "2h 10m", "45m" (Bangla: "২ ঘ ১০ মি"). */
export function formatDuration(ms: number, language: Language): string {
  const totalMinutes = Math.max(1, Math.round(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const [h, m] = language === 'bn' ? [' ঘ', ' মি'] : ['h', 'm'];
  const parts = [
    hours > 0 ? `${hours}${h}` : '',
    minutes > 0 || hours === 0 ? `${minutes}${m}` : '',
  ];
  return localizeDigits(parts.filter(Boolean).join(' '), language);
}
