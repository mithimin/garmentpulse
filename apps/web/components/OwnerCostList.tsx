'use client';

// apps/web/components/OwnerCostList.tsx
//
// A simple list of repair costs for the OWNER's Repair costs page. A small funnel
// button sits at the RIGHT edge above the list. Pressing it opens the filter choices
// (All, Waiting, Approved, Rejected) under it, and pressing it again folds them away.
// Each cost is one calm card: the machine and what it was for on the left, the amount
// and the status word on the right. Waiting costs have a brown edge. Tapping a card
// opens the same pop-up as before (components/ExpenseDialog.tsx), where the owner
// approves or rejects. The manager keeps the table in components/ExpensesCard.tsx.
// Owned by Mithi.

import { useState } from 'react';
import type { Expense, ExpenseStatus } from '@garmentpulse/shared';
import { canDecideExpense, canRecordExpense, EXPENSE_STATUS_LABELS } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';
import { formatDateTime, formatTaka, localizeDigits } from '../language/format';
import { machineName, personName } from '../language/localNames';
import { screenText } from '../language/screenText';
import { ExpenseDialog } from './ExpenseDialog';
import { EmptyMessage } from './StateMessage';
import { ExpenseStatusLabel } from './StatusLabel';

type OwnerCostListProps = {
  /** Who is looking: decides which costs are marked as needing this person. */
  role: 'manager' | 'owner';
  expenses: readonly Expense[];
  /** Loads the list again after a change. */
  onChanged: () => Promise<void>;
};

type Filter = 'all' | ExpenseStatus;
const FILTERS: Filter[] = ['all', 'waiting', 'approved', 'rejected'];

export function OwnerCostList({ role, expenses, onChanged }: OwnerCostListProps) {
  const { language } = useLanguage();
  const [filter, setFilter] = useState<Filter>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  // Only the id is remembered, so an open pop-up follows live changes.
  const [viewingId, setViewingId] = useState<string | null>(null);

  // The owner's marked costs are the waiting ones; the manager's are the approved ones
  // not recorded yet.
  const needsMe = (e: Expense) => (role === 'owner' ? canDecideExpense(e) : canRecordExpense(e));
  const rows = expenses
    .filter((e) => filter === 'all' || e.status === filter)
    .sort(
      (a, b) => Number(needsMe(b)) - Number(needsMe(a)) || b.created_at.localeCompare(a.created_at),
    );
  const viewing = expenses.find((e) => e.id === viewingId);

  const countFor = (f: Filter) =>
    f === 'all' ? expenses.length : expenses.filter((e) => e.status === f).length;
  const filterLabel = (f: Filter) =>
    f === 'all' ? screenText('filterAll', language) : EXPENSE_STATUS_LABELS[f][language];

  return (
    <>
      <div className="owner-filter-bar">
        <button
          type="button"
          className="owner-filter-toggle"
          aria-expanded={filterOpen}
          aria-label={screenText('expensesFilterName', language)}
          onClick={() => setFilterOpen((open) => !open)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 4h18l-7 8.5V19l-4 2v-8.5z" />
          </svg>
        </button>
        {filterOpen ? (
          <div
            className="owner-filters"
            role="group"
            aria-label={screenText('expensesFilterName', language)}
          >
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={f === filter ? 'owner-filter owner-filter-active' : 'owner-filter'}
                aria-pressed={f === filter}
                onClick={() => setFilter(f)}
              >
                {filterLabel(f)} <span>{localizeDigits(String(countFor(f)), language)}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <EmptyMessage text={screenText('noExpenses', language)} />
      ) : (
        <ul className="owner-cost-list">
          {rows.map((expense) => (
            <li key={expense.id}>
              <button
                type="button"
                className={needsMe(expense) ? 'owner-cost owner-cost-waiting' : 'owner-cost'}
                onClick={() => setViewingId(expense.id)}
              >
                <span className="owner-cost-main">
                  <strong>{machineName(expense.report.machine, language)}</strong>
                  <span className="owner-cost-reason">{expense.reason}</span>
                  <span className="owner-cost-who">
                    {personName(expense.technician, language)} ·{' '}
                    {formatDateTime(expense.created_at, language)}
                  </span>
                </span>
                <span className="owner-cost-side">
                  <strong className="owner-cost-amount">
                    {formatTaka(expense.amount, language)}
                  </strong>
                  <ExpenseStatusLabel status={expense.status} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {viewing ? (
        <ExpenseDialog
          key={viewing.id}
          expense={viewing}
          role={role}
          onClose={() => setViewingId(null)}
          onChanged={onChanged}
        />
      ) : null}
    </>
  );
}
