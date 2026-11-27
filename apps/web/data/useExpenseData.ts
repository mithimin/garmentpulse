'use client';

// apps/web/data/useExpenseData.ts
//
// Everything the Repair costs screens ask the backend for, in one place:
//   useExpenses()       every repair cost, newest first, updating live
//   useExpenseLimit()   the owner's expense limit
//   decideExpense()     the owner approves or rejects
//   recordExpense()     the manager records an approved cost
//   setExpenseLimit()   the owner changes the limit
//   expensePhotoUrl()   a short-lived link to an invoice or receipt photo
// With the real backend connected (lib/backend.ts) they use the ready-made calls
// from @garmentpulse/shared (docs/api-contract.md 4.8). Otherwise they use the
// fake costs in fakeExpenseStore.ts, which have no real photos.
// Owned by Mithi.

import { getExpensePhotoUrl } from '@garmentpulse/shared';
import type { Expense, ExpenseDecision, ExpenseLimit } from '@garmentpulse/shared';
import { api, supabase } from '../lib/backend';
import {
  decideFakeExpense,
  getFakeExpenseLimit,
  getFakeExpenses,
  recordFakeExpense,
  setFakeExpenseLimit,
} from './fakeExpenseStore';
import { useBackendData } from './useBackendData';

async function loadExpenses(): Promise<Expense[]> {
  return api ? api.listExpenses() : getFakeExpenses();
}

async function loadExpenseLimit(): Promise<ExpenseLimit> {
  return api ? api.getExpenseLimit() : getFakeExpenseLimit();
}

export const useExpenses = () => useBackendData(loadExpenses, true, 'expenses');
export const useExpenseLimit = () => useBackendData(loadExpenseLimit);

export async function decideExpense(
  expenseId: string,
  decision: ExpenseDecision,
  reason?: string,
): Promise<Expense> {
  return api
    ? api.decideExpense(expenseId, decision, reason)
    : decideFakeExpense(expenseId, decision, reason);
}

export async function recordExpense(expenseId: string): Promise<Expense> {
  return api ? api.recordExpense(expenseId) : recordFakeExpense(expenseId);
}

export async function setExpenseLimit(amount: number): Promise<ExpenseLimit> {
  return api ? api.setExpenseLimit(amount) : setFakeExpenseLimit(amount);
}

/**
 * A link that shows one photo for a few minutes, or null in fake mode (there is no
 * photo). Ask again each time a photo is shown; the link is never saved.
 */
export async function expensePhotoUrl(path: string): Promise<string | null> {
  return supabase ? getExpensePhotoUrl(supabase, path) : null;
}
