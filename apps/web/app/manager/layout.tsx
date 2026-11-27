'use client';

// apps/web/app/manager/layout.tsx
//
// The frame shared by ALL manager pages (Dashboard, Machines, Technicians, Repair
// costs, Invite codes):
//   - the role door (only a manager gets in; others are sent away),
//   - one shared copy of the reports and technicians (data/ManagerData.tsx) and of
//     the repair costs (data/ExpensesData.tsx),
//   - the denim top bar with the nameplate in the middle,
//   - the sidebar with the menu. The menu link of the page you are on is
//     highlighted, and "Repair costs" shows a bubble with how many approved costs
//     are not recorded yet.
// The sidebar behaviour (pushing or sliding over the page) lives in
// components/SidebarShell.tsx, which the owner pages use too. Each page only
// draws its own content.
// Owned by Mithi.

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Cog, KeyRound, LayoutDashboard, Receipt, Users } from 'lucide-react';
import { canRecordExpense } from '@garmentpulse/shared';
import { RoleGate } from '../../auth/RoleGate';
import type { MenuItem } from '../../components/Sidebar';
import { SidebarShell } from '../../components/SidebarShell';
import { ExpensesProvider, useSharedExpenses } from '../../data/ExpensesData';
import { ManagerDataProvider } from '../../data/ManagerData';
import { useLanguage } from '../../language/LanguageContext';
import { screenText } from '../../language/screenText';

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGate role="manager">
      <ManagerDataProvider>
        <ExpensesProvider>
          <ManagerFrame>{children}</ManagerFrame>
        </ExpensesProvider>
      </ManagerDataProvider>
    </RoleGate>
  );
}

function ManagerFrame({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const pathname = usePathname();
  const expenses = useSharedExpenses();
  const menu: MenuItem[] = [
    {
      label: screenText('menuDashboard', language),
      href: '/manager',
      icon: <LayoutDashboard size={18} strokeWidth={1.8} aria-hidden="true" />,
      active: pathname === '/manager',
    },
    {
      label: screenText('menuMachines', language),
      href: '/manager/machines',
      icon: <Cog size={18} strokeWidth={1.8} aria-hidden="true" />,
      active: pathname.startsWith('/manager/machines'),
    },
    {
      label: screenText('menuTechnicians', language),
      href: '/manager/technicians',
      icon: <Users size={18} strokeWidth={1.8} aria-hidden="true" />,
      active: pathname.startsWith('/manager/technicians'),
    },
    {
      label: screenText('menuExpenses', language),
      href: '/manager/expenses',
      icon: <Receipt size={18} strokeWidth={1.8} aria-hidden="true" />,
      active: pathname.startsWith('/manager/expenses'),
      count: expenses.data?.filter(canRecordExpense).length,
    },
  ];
  menu.push({
    label: screenText('menuInviteCodes', language),
    href: '/manager/codes',
    icon: <KeyRound size={18} strokeWidth={1.8} aria-hidden="true" />,
    active: pathname.startsWith('/manager/codes'),
  });

  return (
    <SidebarShell role="manager" menu={menu}>
      {children}
    </SidebarShell>
  );
}
