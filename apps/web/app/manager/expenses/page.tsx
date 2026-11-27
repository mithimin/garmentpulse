'use client';

// apps/web/app/manager/expenses/page.tsx
//
// The manager's "Repair costs" page (FR-04, card GP-48; docs/api-contract.md 4.8).
// Every repair cost technicians sent, with its photos, in the same simple card list
// as the owner's page (components/OwnerCostList.tsx). The manager records the
// approved ones; approving and rejecting is the owner's job. The costs come from
// app/manager/layout.tsx (data/ExpensesData.tsx) and update live. Owned by Mithi.

import { DataGate } from '../../../components/DataGate';
import { OwnerCostList } from '../../../components/OwnerCostList';
import { useSharedExpenses } from '../../../data/ExpensesData';
import '../../owner/expenses/owner-costs.css';
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
      <div className="expense-page owner-costs-page">
        <DataGate state={expenses}>
          {(rows) => <OwnerCostList role="manager" expenses={rows} onChanged={expenses.reload} />}
        </DataGate>
      </div>
    </>
  );
}
