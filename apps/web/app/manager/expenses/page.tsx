'use client';

// apps/web/app/manager/expenses/page.tsx
//
// The manager's "Repair costs" page (FR-04, card GP-48; docs/api-contract.md 4.8).
// Every repair cost technicians sent, with its photos. The manager records the
// approved ones; approving and rejecting is the owner's job. The costs come from
// app/manager/layout.tsx (data/ExpensesData.tsx) and update live. Owned by Mithi.

import { DataGate } from '../../../components/DataGate';
import { ExpensesCard } from '../../../components/ExpensesCard';
import { useSharedExpenses } from '../../../data/ExpensesData';
import { useLanguage } from '../../../language/LanguageContext';
import { screenText } from '../../../language/screenText';

export default function ManagerExpensesPage() {
  const { language } = useLanguage();
  const expenses = useSharedExpenses();

  return (
    <>
      <div className="greeting">
        <h1>{screenText('menuExpenses', language)}</h1>
        <p className="greeting-line">{screenText('expensesSubManager', language)}</p>
      </div>
      <DataGate state={expenses}>
        {(rows) => <ExpensesCard role="manager" expenses={rows} onChanged={expenses.reload} />}
      </DataGate>
    </>
  );
}
