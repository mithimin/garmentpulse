'use client';

// apps/web/components/ExpenseDialog.tsx
//
// The pop-up that opens with the "Open" button on a repair cost. It shows
// everything about the cost: the machine and job, the amount, what it was for, who
// sent it, both photos, and what was decided. The action buttons live ONLY here,
// so nobody approves or records a cost without seeing it:
//   - owner, cost still waiting:    Approve (asks "are you sure?") or Reject
//                                   (a short reason is required),
//   - manager, approved cost:       Record.
// Approving and rejecting cannot be undone (docs/api-contract.md 4.8). A failure
// becomes a friendly sentence and the list is loaded again. Owned by Mithi.

import { useState } from 'react';
import type { Expense, Role } from '@garmentpulse/shared';
import {
  canDecideExpense,
  canRecordExpense,
  MAX_REJECTION_REASON_LENGTH,
} from '@garmentpulse/shared';
import { decideExpense, recordExpense } from '../data/useExpenseData';
import { useLanguage } from '../language/LanguageContext';
import { errorSentence } from '../language/errorText';
import { formatDateTime, formatTaka } from '../language/format';
import { machineName, personName } from '../language/localNames';
import { screenText } from '../language/screenText';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { ExpensePhoto } from './ExpensePhoto';
import { Field, TextAreaInput } from './Field';
import { ExpenseStatusLabel } from './StatusLabel';

type ExpenseDialogProps = {
  expense: Expense;
  /** Who is looking: decides which buttons show. */
  role: Extract<Role, 'manager' | 'owner'>;
  onClose: () => void;
  /** Loads the list again after a change. */
  onChanged: () => Promise<void>;
};

type Step = 'view' | 'approve' | 'reject';

export function ExpenseDialog({ expense, role, onClose, onChanged }: ExpenseDialogProps) {
  const { language } = useLanguage();
  const [step, setStep] = useState<Step>('view');
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<unknown>(null);

  const canDecide = role === 'owner' && canDecideExpense(expense);
  const canRecord = role === 'manager' && canRecordExpense(expense);

  async function run(action: () => Promise<Expense>) {
    setBusy(true);
    setProblem(null);
    try {
      await action();
    } catch (error) {
      setProblem(error);
    }
    // Also after a failure: the cost may have changed meanwhile.
    await onChanged();
    setStep('view');
    setBusy(false);
  }

  function reject() {
    if (!reason.trim()) {
      setReasonError(screenText('rejectReasonMissing', language));
      return;
    }
    void run(() => decideExpense(expense.id, 'rejected', reason.trim()));
  }

  const dateOf = (iso: string | null) => (iso ? ` · ${formatDateTime(iso, language)}` : '');

  return (
    <Dialog label={screenText('expenseDetailsTitle', language)} onClose={onClose} wide>
      <h2>{machineName(expense.report.machine, language)}</h2>
      <p className="expense-amount">{formatTaka(expense.amount, language)}</p>

      <dl className="details">
        <dt>{screenText('colReason', language)}</dt>
        <dd>{expense.reason}</dd>
        <dt>{screenText('expenseJob', language)}</dt>
        <dd>{expense.report.description}</dd>
        <dt>{screenText('colTechnician', language)}</dt>
        <dd>{personName(expense.technician, language)}</dd>
        <dt>{screenText('expenseSentOn', language)}</dt>
        <dd>{formatDateTime(expense.created_at, language)}</dd>
        <dt>{screenText('expenseLimitThen', language)}</dt>
        <dd>
          {expense.limit_at_submit === null
            ? screenText('expenseNoLimitThen', language)
            : formatTaka(expense.limit_at_submit, language)}
        </dd>
        <dt>{screenText('colStatus', language)}</dt>
        <dd>
          <ExpenseStatusLabel status={expense.status} />
        </dd>
        {expense.status !== 'waiting' ? (
          <>
            <dt>{screenText('expenseDecidedBy', language)}</dt>
            <dd>
              {expense.decided_by
                ? `${personName(expense.decided_by, language)}${dateOf(expense.decided_at)}`
                : screenText('expenseAutoApproved', language)}
            </dd>
          </>
        ) : null}
        {expense.rejection_reason ? (
          <>
            <dt>{screenText('expenseRejectedBecause', language)}</dt>
            <dd>{expense.rejection_reason}</dd>
          </>
        ) : null}
        {expense.status === 'approved' ? (
          <>
            <dt>{screenText('expenseRecordedBy', language)}</dt>
            <dd>
              {expense.recorded_by
                ? `${personName(expense.recorded_by, language)}${dateOf(expense.recorded_at)}`
                : screenText('notRecordedTag', language)}
            </dd>
          </>
        ) : null}
      </dl>

      <div className="photos">
        <ExpensePhoto
          key={expense.invoice_path}
          label={screenText('invoicePhoto', language)}
          path={expense.invoice_path}
        />
        <ExpensePhoto
          key={expense.receipt_path}
          label={screenText('receiptPhoto', language)}
          path={expense.receipt_path}
        />
      </div>

      {problem ? (
        <p className="field-error" role="alert">
          {errorSentence(problem, language)}
        </p>
      ) : null}

      {canDecide && step === 'approve' ? (
        <>
          <p className="dialog-note">
            {screenText('approveAsk', language).replace(
              '{amount}',
              formatTaka(expense.amount, language),
            )}
          </p>
          <div className="dialog-actions">
            <Button onClick={() => setStep('view')} disabled={busy}>
              {screenText('goBack', language)}
            </Button>
            <Button
              kind="main"
              disabled={busy}
              onClick={() => void run(() => decideExpense(expense.id, 'approved'))}
            >
              {screenText(busy ? 'saving' : 'approveYes', language)}
            </Button>
          </div>
        </>
      ) : canDecide && step === 'reject' ? (
        <>
          <div className="reject-box">
            <Field label={screenText('rejectReasonLabel', language)} error={reasonError}>
              {(id) => (
                <TextAreaInput
                  id={id}
                  rows={3}
                  maxLength={MAX_REJECTION_REASON_LENGTH}
                  value={reason}
                  autoFocus
                  onChange={(event) => {
                    setReason(event.target.value);
                    setReasonError('');
                  }}
                />
              )}
            </Field>
          </div>
          <div className="dialog-actions">
            <Button onClick={() => setStep('view')} disabled={busy}>
              {screenText('goBack', language)}
            </Button>
            <Button kind="danger" disabled={busy} onClick={reject}>
              {screenText(busy ? 'saving' : 'rejectYes', language)}
            </Button>
          </div>
        </>
      ) : (
        <div className="dialog-actions">
          <Button onClick={onClose}>{screenText('close', language)}</Button>
          {canDecide ? (
            <>
              <Button kind="danger" onClick={() => setStep('reject')}>
                {screenText('rejectButton', language)}
              </Button>
              <Button kind="main" onClick={() => setStep('approve')}>
                {screenText('approveButton', language)}
              </Button>
            </>
          ) : null}
          {canRecord ? (
            <Button
              kind="main"
              disabled={busy}
              onClick={() => void run(() => recordExpense(expense.id))}
            >
              {screenText(busy ? 'saving' : 'recordButton', language)}
            </Button>
          ) : null}
        </div>
      )}
    </Dialog>
  );
}
