'use client';

// apps/web/app/owner/expenses/page.tsx
//
// The owner's "Repair costs" page (FR-05, card GP-49; docs/api-contract.md 4.8).
// At the top the expense limit, below it every repair cost with its photos. The
// owner approves or rejects the waiting ones. The costs come from
// app/owner/layout.tsx (data/ExpensesData.tsx) and update live. Owned by Mithi.

import { DataGate } from '../../../components/DataGate';
import { ExpenseLimitCard } from '../../../components/ExpenseLimitCard';
import { ExpensesCard } from '../../../components/ExpensesCard';
import { useSharedExpenses } from '../../../data/ExpensesData';
import { useLanguage } from '../../../language/LanguageContext';
import { screenText } from '../../../language/screenText';

export default function OwnerExpensesPage() {
  const { language } = useLanguage();
  const expenses = useSharedExpenses();

  return (
    <>
      <div className="greeting">
        <h1>{screenText('menuExpenses', language)}</h1>
        <p className="greeting-line">{screenText('expensesSubOwner', language)}</p>
      </div>
      <div className="expense-page">
        <ExpenseLimitCard />
        <DataGate state={expenses}>
          {(rows) => <ExpensesCard role="owner" expenses={rows} onChanged={expenses.reload} />}
        </DataGate>
      </div>
    </>
  );
}
