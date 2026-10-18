'use client';

// apps/web/app/manager/layout.tsx
//
// The frame shared by ALL manager pages (Dashboard, Reports, Technicians):
//   - the role door (only a manager gets in; others are sent away),
//   - one shared copy of the reports and technicians (data/ManagerData.tsx),
//   - the denim top bar with the nameplate in the middle,
//   - the sidebar with the menu. The menu link of the page you are on is
//     highlighted, and "Reports" shows a bubble with how many reports wait for a
//     technician (the queue). A fourth link, Invite codes, shows while the data is fake.
// The sidebar behaviour (pushing or sliding over the page) lives in
// components/SidebarShell.tsx, which the owner pages use too. Each page only
// draws its own content.
// Owned by Mithi.

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { KeyRound, LayoutDashboard, Users, Wrench } from 'lucide-react';
import { isInQueue } from '@garmentpulse/shared';
import { RoleGate } from '../../auth/RoleGate';
import type { MenuItem } from '../../components/Sidebar';
import { SidebarShell } from '../../components/SidebarShell';
import { ManagerDataProvider, useManagerData } from '../../data/ManagerData';
import { useLanguage } from '../../language/LanguageContext';
import { screenText } from '../../language/screenText';
import { backendIsReal } from '../../lib/backend';

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGate role="manager">
      <ManagerDataProvider>
        <ManagerFrame>{children}</ManagerFrame>
      </ManagerDataProvider>
    </RoleGate>
  );
}

function ManagerFrame({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const pathname = usePathname();
  const { reports } = useManagerData();
  const queueCount = (reports.data ?? []).filter(isInQueue).length;
  const menu: MenuItem[] = [
    {
      label: screenText('menuDashboard', language),
      href: '/manager',
      icon: <LayoutDashboard size={18} strokeWidth={1.8} aria-hidden="true" />,
      active: pathname === '/manager',
    },
    {
      label: screenText('menuReports', language),
      href: '/manager/reports',
      icon: <Wrench size={18} strokeWidth={1.8} aria-hidden="true" />,
      count: queueCount,
      active: pathname.startsWith('/manager/reports'),
    },
    {
      label: screenText('menuTechnicians', language),
      href: '/manager/technicians',
      icon: <Users size={18} strokeWidth={1.8} aria-hidden="true" />,
      active: pathname.startsWith('/manager/technicians'),
    },
  ];
  // Invite codes are fake for now: hidden while the real backend is on (no invite-code backend yet).
  if (!backendIsReal) {
    menu.push({
      label: screenText('menuInviteCodes', language),
      href: '/manager/codes',
      icon: <KeyRound size={18} strokeWidth={1.8} aria-hidden="true" />,
      active: pathname.startsWith('/manager/codes'),
    });
  }

  return (
    <SidebarShell role="manager" menu={menu}>
      {children}
    </SidebarShell>
  );
}
