// packages/shared/src/helpers.ts
//
// Small rules both apps (and the fake data) need, written once so they cannot
// drift apart. They copy the rules in docs/api-contract.md section 2.6 and
// section 3. The real backend calculates the same things on the server.
// Owned by Sakib.

import type { Expense, ExpenseStatus, Report, TechnicianAvailability } from './types';

/** A report is "in the queue" when it is waiting and nobody is assigned yet. */
export function isInQueue(report: Report): boolean {
  return report.status === 'waiting' && report.technician === null;
}

/**
 * A technician is busy when they have at least one assigned report that is not
 * resolved. Otherwise they are free. (The backend calculates this when reading;
 * it is never stored.)
 */
export function computeAvailability(
  reports: readonly Report[],
  technicianId: string,
): TechnicianAvailability {
  const hasOpenJob = reports.some(
    (r) => r.technician?.id === technicianId && r.status !== 'resolved',
  );
  return hasOpenJob ? 'busy' : 'free';
}

/** The three count boxes on the owner's screen. */
export function summarizeReports(reports: readonly Report[]) {
  return {
    waiting: reports.filter((r) => r.status === 'waiting').length,
    in_progress: reports.filter((r) => r.status === 'in_progress').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
  };
}

/**
 * The status a new cost gets (contract section 4.8): approved when it is at or
 * under the owner's limit; waiting when it is over, or when no limit is set.
 * The real backend decides this on the server. Apps may use it only to show a
 * hint or to build fake data.
 */
export function expenseStatusFor(amount: number, limit: number | null): ExpenseStatus {
  return limit !== null && amount <= limit ? 'approved' : 'waiting';
}

/** Should the owner's Approve and Reject buttons show for this cost? */
export function canDecideExpense(expense: Expense): boolean {
  return expense.status === 'waiting';
}

/** Should the manager's Record button show for this cost? */
export function canRecordExpense(expense: Expense): boolean {
  return expense.status === 'approved' && expense.recorded_at === null;
}
