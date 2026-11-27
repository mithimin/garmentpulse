'use client';

// apps/web/app/owner/layout.tsx
//
// The frame shared by the owner's pages (docs/mvp.md 2.5 and 3.1): the role door
// (only an owner gets in), one shared copy of the repair costs
// (data/ExpensesData.tsx), the denim top bar and a sidebar with FOUR pages:
//   - Dashboard     (/owner)          the Waiting / In progress / Resolved count boxes,
//   - Reports       (/owner/reports)  a read-only list of all reports,
//   - Repair costs  (/owner/expenses) the expense limit and approving costs; its
//                                     bubble counts the costs waiting for the owner,
//   - Manager codes (/owner/codes)    make one-time invite codes for new managers.
// Owned by Mithi.

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { KeyRound, LayoutDashboard, Receipt, Wrench } from 'lucide-react';
import { canDecideExpense } from '@garmentpulse/shared';
import { RoleGate } from '../../auth/RoleGate';
import type { MenuItem } from '../../components/Sidebar';
import { SidebarShell } from '../../components/SidebarShell';
import { ExpensesProvider, useSharedExpenses } from '../../data/ExpensesData';
import { useLanguage } from '../../language/LanguageContext';
import { screenText } from '../../language/screenText';

export default function OwnerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGate role="owner">
      <ExpensesProvider>
        <OwnerFrame>{children}</OwnerFrame>
      </ExpensesProvider>
    </RoleGate>
  );
}

function OwnerFrame({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const pathname = usePathname();
  const expenses = useSharedExpenses();

  const menu: MenuItem[] = [
    {
      label: screenText('menuDashboard', language),
      href: '/owner',
      icon: <LayoutDashboard size={18} strokeWidth={1.8} aria-hidden="true" />,
      active: pathname === '/owner',
    },
    {
      label: screenText('menuReports', language),
      href: '/owner/reports',
      icon: <Wrench size={18} strokeWidth={1.8} aria-hidden="true" />,
      active: pathname.startsWith('/owner/reports'),
    },
    {
      label: screenText('menuExpenses', language),
      href: '/owner/expenses',
      icon: <Receipt size={18} strokeWidth={1.8} aria-hidden="true" />,
      active: pathname.startsWith('/owner/expenses'),
      count: expenses.data?.filter(canDecideExpense).length,
    },
  ];
  menu.push({
    label: screenText('codesTitle', language),
    href: '/owner/codes',
    icon: <KeyRound size={18} strokeWidth={1.8} aria-hidden="true" />,
    active: pathname.startsWith('/owner/codes'),
  });

  return (
    <SidebarShell role="owner" menu={menu}>
      {children}
    </SidebarShell>
  );
}
