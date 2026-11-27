'use client';

// apps/web/data/ExpensesData.tsx
//
// Loads the repair costs ONCE for a whole portal (manager or owner) and shares
// them, so the number bubble in the menu and the Repair costs page always agree
// and there is only one live connection for them.
// Owned by Mithi.

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useExpenses } from './useExpenseData';

type ExpensesState = ReturnType<typeof useExpenses>;

const ExpensesContext = createContext<ExpensesState | null>(null);

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const expenses = useExpenses();
  return <ExpensesContext.Provider value={expenses}>{children}</ExpensesContext.Provider>;
}

/** The shared repair costs for a manager or owner page. */
export function useSharedExpenses(): ExpensesState {
  const value = useContext(ExpensesContext);
  if (!value) throw new Error('useSharedExpenses must be used inside <ExpensesProvider>');
  return value;
}
