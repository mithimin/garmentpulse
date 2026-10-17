'use client';

// apps/web/app/manager/layout.tsx
//
// The frame shared by ALL manager pages (Dashboard, Reports, Technicians):
//   - the role door (only a manager gets in; others are sent away),
//   - one shared copy of the reports and technicians (data/ManagerData.tsx),
//   - the denim top bar with the nameplate in the middle,
//   - the sidebar with the menu. The menu link of the page you are on is
//     highlighted, and "Reports" shows a bubble with how many reports wait for a
//     technician (the queue).
// On a big screen (tablet and up) the sidebar PUSHES the page, so the page is
// always fully visible beside it. On a phone it SLIDES OVER the page and closes
// when you pick a page or tap outside. The big-screen choice (open or closed) is
// remembered in this browser. Each page only draws its own content.
// Owned by Mithi.

import { useState } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Wrench } from 'lucide-react';
import { isInQueue } from '@garmentpulse/shared';
import { RoleGate } from '../../auth/RoleGate';
import { useAuth } from '../../auth/AuthContext';
import { Sidebar } from '../../components/Sidebar';
import type { MenuItem } from '../../components/Sidebar';
import { TopBar } from '../../components/TopBar';
import { ManagerDataProvider, useManagerData } from '../../data/ManagerData';
import { useLanguage } from '../../language/LanguageContext';
import { screenText } from '../../language/screenText';

const STORAGE_KEY = 'garmentpulse-web-sidebar-open';
/** Below this width the sidebar slides over the page instead of pushing it. */
const PHONE_QUERY = '(max-width: 767px)';

function isPhone(): boolean {
  return window.matchMedia(PHONE_QUERY).matches;
}

/** Open on a big screen unless the person closed it before; closed on a phone. */
function startOpen(): boolean {
  if (isPhone()) return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'closed';
  } catch {
    return true;
  }
}

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
  const { logOut } = useAuth();
  const { language } = useLanguage();
  const pathname = usePathname();
  const { reports } = useManagerData();
  const queueCount = (reports.data ?? []).filter(isInQueue).length;
  // This frame only draws in the browser (after the role door), so reading the
  // screen size here is safe.
  const [open, setOpen] = useState(startOpen);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (!isPhone()) {
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? 'open' : 'closed');
      } catch {
        // Not remembering is fine.
      }
    }
  }

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

  return (
    <>
      <TopBar role="manager" onLogOut={logOut} onToggleSidebar={toggle} sidebarOpen={open} />
      <div className={open ? 'shell shell-open' : 'shell'}>
        {open ? (
          <>
            <Sidebar
              menu={menu}
              onLogOut={logOut}
              onNavigate={() => {
                if (isPhone()) setOpen(false);
              }}
            />
            {/* On a phone the sidebar covers the page, so a tap outside closes it. */}
            <div className="sidebar-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
          </>
        ) : null}
        <main className="page">{children}</main>
      </div>
    </>
  );
}
