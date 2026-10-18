'use client';

// apps/web/app/owner/layout.tsx
//
// The frame shared by the owner's pages (docs/mvp.md 2.5): the role door (only an
// owner gets in), the denim top bar and a sidebar with TWO pages:
//   - Reports       (/owner)        a read-only list of all reports and counts,
//   - Manager codes (/owner/codes)  make one-time invite codes for new managers.
// The "Manager codes" link is hidden while the real backend is on, because the
// real invite-code backend is not built yet (see supabase/STATUS.md).
// Owned by Mithi.

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { KeyRound, Wrench } from 'lucide-react';
import { RoleGate } from '../../auth/RoleGate';
import type { MenuItem } from '../../components/Sidebar';
import { SidebarShell } from '../../components/SidebarShell';
import { useLanguage } from '../../language/LanguageContext';
import { screenText } from '../../language/screenText';
import { backendIsReal } from '../../lib/backend';

export default function OwnerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGate role="owner">
      <OwnerFrame>{children}</OwnerFrame>
    </RoleGate>
  );
}

function OwnerFrame({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const pathname = usePathname();

  const menu: MenuItem[] = [
    {
      label: screenText('menuReports', language),
      href: '/owner',
      icon: <Wrench size={18} strokeWidth={1.8} aria-hidden="true" />,
      active: pathname === '/owner',
    },
  ];
  if (!backendIsReal) {
    menu.push({
      label: screenText('codesTitle', language),
      href: '/owner/codes',
      icon: <KeyRound size={18} strokeWidth={1.8} aria-hidden="true" />,
      active: pathname.startsWith('/owner/codes'),
    });
  }

  return (
    <SidebarShell role="owner" menu={menu}>
      {children}
    </SidebarShell>
  );
}
