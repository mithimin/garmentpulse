// apps/mobile/src/data/fakeExpenses.ts
//
// FAKE costs for the technician's job page. The real backend is not connected yet:
// the calls submit_expense and list_my_expenses are not in packages/shared yet
// (docs/api-contract.md section 4.8). So this file keeps the costs in memory only,
// they disappear when the app closes, and nothing is sent to the backend.
// It follows the same rules as the contract so the screen behaves the same later:
//   - amount above 0, at most 10,000,000, at most 2 decimal places;
//   - status is decided when the cost is sent: at or under the owner's limit =
//     approved, otherwise waiting (also waiting when no limit is set).
// Replace this file with the real calls once the shared toolbox has them.
// Owned by Rubaiya.

import { useSyncExternalStore } from 'react';

export type FakeExpenseStatus = 'waiting' | 'approved' | 'rejected';

export type FakeExpense = {
  id: string;
  reportId: string;
  amount: number; // taka
  reason: string;
  status: FakeExpenseStatus;
  createdAt: string; // ISO date and time
};

/** The pretend owner limit in taka. Costs at or under it are approved at once. */
export const FAKE_EXPENSE_LIMIT = 5000;

/** The highest amount the backend accepts (docs/api-contract.md 4.8). */
export const MAX_EXPENSE_AMOUNT = 10_000_000;

/** The longest reason the backend accepts (docs/api-contract.md 4.8). */
export const MAX_REASON_LENGTH = 500;

// The list lives here, outside React, so every screen that reads it sees the same costs.
let expenses: FakeExpense[] = [];
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): FakeExpense[] {
  return expenses;
}

function notify() {
  listeners.forEach((listener) => listener());
}

/** Reads a plain amount such as "450" or "99.5". Returns null when it is not valid. */
export function parseExpenseAmount(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (value <= 0 || value > MAX_EXPENSE_AMOUNT) return null;
  return value;
}

/** The costs sent for one job, newest first. Updates when a new cost is sent. */
export function useFakeExpenses(reportId: string): FakeExpense[] {
  const all = useSyncExternalStore(subscribe, getSnapshot);
  return all
    .filter((expense) => expense.reportId === reportId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Sends a fake cost. The caller must already have checked the amount and reason. */
export function sendFakeExpense(reportId: string, amount: number, reason: string): FakeExpense {
  const expense: FakeExpense = {
    id: `fake-${Date.now()}`,
    reportId,
    amount,
    reason: reason.trim(),
    status: amount <= FAKE_EXPENSE_LIMIT ? 'approved' : 'waiting',
    createdAt: new Date().toISOString(),
  };
  expenses = [expense, ...expenses];
  notify();
  return expense;
}
