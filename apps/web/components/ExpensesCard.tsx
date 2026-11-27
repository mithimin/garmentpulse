'use client';

// apps/web/components/ExpensesCard.tsx
//
// The table of repair costs, used by the manager and the owner. It has filter tabs
// (All, Waiting, Approved, Rejected). The costs that need THIS person come first,
// with the same left-edge mark as queued reports: for the owner the ones waiting
// for a decision, for the manager the approved ones not recorded yet. A rejected cost shows the owner's
// reason in the list. "Open" shows the details, photos and action buttons
// (components/ExpenseDialog.tsx). Owned by Mithi.

import { useState } from 'react';
import type { Expense, ExpenseStatus, Role } from '@garmentpulse/shared';
import { canDecideExpense, canRecordExpense, EXPENSE_STATUS_LABELS } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';
import { formatDateTime, formatTaka, localizeDigits } from '../language/format';
import { machineName, personName } from '../language/localNames';
import { screenText } from '../language/screenText';
import { Button } from './Button';
import { Card } from './Card';
import { DataTable } from './DataTable';
import { ExpenseDialog } from './ExpenseDialog';
import { EmptyMessage } from './StateMessage';
import { ExpenseStatusLabel } from './StatusLabel';

type ExpensesCardProps = {
  role: Extract<Role, 'manager' | 'owner'>;
  expenses: readonly Expense[];
  /** Loads the list again after a change. */
  onChanged: () => Promise<void>;
};

type Filter = 'all' | ExpenseStatus;
const FILTERS: Filter[] = ['all', 'waiting', 'approved', 'rejected'];

export function ExpensesCard({ role, expenses, onChanged }: ExpensesCardProps) {
  const { language } = useLanguage();
  const [filter, setFilter] = useState<Filter>('all');
  // Only the id is remembered, so an open pop-up follows live changes.
  const [viewingId, setViewingId] = useState<string | null>(null);

  const needsMe = role === 'owner' ? canDecideExpense : canRecordExpense;
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
      <Card className="card-list stitched">
        <div
          className="filter-tabs"
          role="group"
          aria-label={screenText('expensesFilterName', language)}
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={f === filter ? 'filter-tab filter-tab-active' : 'filter-tab'}
              data-filter={f}
              aria-pressed={f === filter}
              onClick={() => setFilter(f)}
            >
              <span className="filter-dot" aria-hidden="true" />
              <span className="filter-name">{filterLabel(f)}</span>
              <span className="filter-count">{localizeDigits(String(countFor(f)), language)}</span>
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <EmptyMessage text={screenText('noExpenses', language)} />
        ) : (
          <DataTable stack>
            <thead>
              <tr>
                <th>{screenText('colMachine', language)}</th>
                <th>{screenText('colReason', language)}</th>
                <th>{screenText('colTechnician', language)}</th>
                <th>{screenText('colAmount', language)}</th>
                <th>{screenText('colStatus', language)}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((expense) => (
                <tr key={expense.id} className={needsMe(expense) ? 'row-attention' : undefined}>
                  <td>
                    <strong>{machineName(expense.report.machine, language)}</strong>
                  </td>
                  <td data-label={screenText('colReason', language)}>{expense.reason}</td>
                  <td data-label={screenText('colTechnician', language)}>
                    {personName(expense.technician, language)}
                    <div className="cell-sub nowrap">
                      {formatDateTime(expense.created_at, language)}
                    </div>
                  </td>
                  <td data-label={screenText('colAmount', language)}>
                    <strong className="nowrap">{formatTaka(expense.amount, language)}</strong>
                  </td>
                  <td data-label={screenText('colStatus', language)}>
                    <ExpenseStatusLabel status={expense.status} />
                    {expense.status === 'approved' ? (
                      <div className="cell-sub">
                        {screenText(
                          expense.recorded_at ? 'recordedTag' : 'notRecordedTag',
                          language,
                        )}
                      </div>
                    ) : null}
                    {expense.rejection_reason ? (
                      <div className="cell-sub">{expense.rejection_reason}</div>
                    ) : null}
                  </td>
                  <td className="actions">
                    <Button small onClick={() => setViewingId(expense.id)}>
                      {screenText('openButton', language)}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </Card>

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
