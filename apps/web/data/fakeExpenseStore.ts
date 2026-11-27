// apps/web/data/fakeExpenseStore.ts
//
// FAKE repair costs that can CHANGE, used when the real backend is not connected
// (lib/backend.ts). It starts as a copy of FAKE_EXPENSES and FAKE_EXPENSE_LIMIT
// from @garmentpulse/shared. Approving, rejecting, recording and setting the limit
// change the copy in memory, so the screens really move while testing. A page
// refresh (also switching between the manager and owner login pages) puts it back.
// It copies the rules and error codes of docs/api-contract.md section 4.8.
// Owned by Mithi.

import {
  ApiError,
  canDecideExpense,
  canRecordExpense,
  FAKE_EXPENSE_LIMIT,
  FAKE_EXPENSES,
  FAKE_PEOPLE,
  MAX_REJECTION_REASON_LENGTH,
} from '@garmentpulse/shared';
import type { Expense, ExpenseDecision, ExpenseLimit, Role } from '@garmentpulse/shared';

let expenses: Expense[] = FAKE_EXPENSES.map((expense) => ({ ...expense }));
let limit: ExpenseLimit = { ...FAKE_EXPENSE_LIMIT };

/** A short wait, so buttons show "Saving..." like with a real backend. */
const wait = () => new Promise((resolve) => setTimeout(resolve, 300));

function fakePerson(role: Role): Expense['technician'] {
  const person = FAKE_PEOPLE.find((p) => p.role === role);
  if (!person) throw new ApiError('NOT_FOUND');
  return { id: person.id, display_name: person.display_name };
}

function find(expenseId: string): Expense {
  const expense = expenses.find((e) => e.id === expenseId);
  if (!expense) throw new ApiError('NOT_FOUND');
  return expense;
}

function save(updated: Expense): Expense {
  expenses = expenses.map((e) => (e.id === updated.id ? updated : e));
  return updated;
}

export function getFakeExpenses(): Expense[] {
  return expenses.map((expense) => ({ ...expense }));
}

export function getFakeExpenseLimit(): ExpenseLimit {
  return { ...limit };
}

/** The owner says yes or no to a waiting cost. */
export async function decideFakeExpense(
  expenseId: string,
  decision: ExpenseDecision,
  reason?: string,
): Promise<Expense> {
  await wait();
  const expense = find(expenseId);
  if (!canDecideExpense(expense)) throw new ApiError('EXPENSE_ALREADY_DECIDED');
  const why = reason?.trim() ?? '';
  if (decision === 'rejected' && (!why || why.length > MAX_REJECTION_REASON_LENGTH)) {
    throw new ApiError('INVALID_INPUT');
  }
  const now = new Date().toISOString();
  return save({
    ...expense,
    status: decision,
    decided_by: fakePerson('owner'),
    decided_at: now,
    rejection_reason: decision === 'rejected' ? why : null,
    updated_at: now,
  });
}

/** The manager records an approved cost. */
export async function recordFakeExpense(expenseId: string): Promise<Expense> {
  await wait();
  const expense = find(expenseId);
  if (expense.status !== 'approved') throw new ApiError('EXPENSE_NOT_APPROVED');
  if (!canRecordExpense(expense)) throw new ApiError('EXPENSE_ALREADY_RECORDED');
  const now = new Date().toISOString();
  return save({
    ...expense,
    recorded_by: fakePerson('manager'),
    recorded_at: now,
    updated_at: now,
  });
}

/** The owner sets the limit. Older costs keep their status. */
export async function setFakeExpenseLimit(amount: number): Promise<ExpenseLimit> {
  await wait();
  limit = { amount, updated_at: new Date().toISOString() };
  return { ...limit };
}
