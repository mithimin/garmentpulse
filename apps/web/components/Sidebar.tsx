'use client';

// apps/web/components/Sidebar.tsx
//
// The menu on the left side of the manager pages: one link per page (Dashboard,
// Reports, Technicians) with an icon. The page you are on is white with a dashed
// outline, and "Reports" can show a bubble with a number. A Log out button sits at
// the bottom. It has the same denim look as the top bar. Opening and closing it is
// done by the button in the top bar; app/manager/layout.tsx decides if it pushes
// the page (big screens) or slides over it (phones). Owned by Mithi.

import type { ReactNode } from 'react';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useLanguage } from '../language/LanguageContext';
import { localizeDigits } from '../language/format';
import { screenText } from '../language/screenText';

export type MenuItem = {
  label: string;
  href: string;
  icon: ReactNode;
  /** A small number bubble next to the label (for example how many reports wait). */
  count?: number;
  /** The page the person is on. It is drawn white with a dashed outline. */
  active?: boolean;
};

type SidebarProps = {
  menu: MenuItem[];
  onLogOut: () => void;
  /** Called when a link is chosen (a phone closes the sidebar then). */
  onNavigate: () => void;
};

export function Sidebar({ menu, onLogOut, onNavigate }: SidebarProps) {
  const { language } = useLanguage();
  return (
    <aside className="sidebar" aria-label={screenText('menuName', language)}>
      <nav className="sidebar-menu">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={item.active ? 'menu-link menu-link-active' : 'menu-link'}
            aria-current={item.active ? 'page' : undefined}
            onClick={onNavigate}
          >
            {item.icon}
            {item.label}
            {item.count !== undefined && item.count > 0 ? (
              <span className="count-bubble">{localizeDigits(String(item.count), language)}</span>
            ) : null}
          </Link>
        ))}
      </nav>
      <button type="button" className="menu-link sidebar-logout" onClick={onLogOut}>
        <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />
        {screenText('logOut', language)}
      </button>
    </aside>
  );
}
