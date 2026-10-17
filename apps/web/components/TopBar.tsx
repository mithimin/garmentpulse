'use client';

// apps/web/components/TopBar.tsx
//
// The denim bar along the top of every page after login (design system 9.5):
//   - left:   the logo, the app name and the role name,
//   - middle: menu links with icons (only when a page passes `menu`; the owner's
//             one-screen page passes none),
//   - right:  the language switch and (when someone is logged in) a Log out button.
// A dashed gold stitch line runs along the bottom edge.
// Pass `role` to show the role name; pass `onLogOut` to show the Log out button.
// Owned by Mithi.

import type { ReactNode } from 'react';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import type { Role } from '@garmentpulse/shared';
import { ROLE_LABELS } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';
import { localizeDigits } from '../language/format';
import { screenText } from '../language/screenText';
import { LanguageSwitch } from './LanguageSwitch';
import { Logo } from './Logo';

export type MenuItem = {
  label: string;
  href: string;
  icon: ReactNode;
  /** A small number bubble next to the label (for example how many reports wait). */
  count?: number;
  /** The page the person is on. It is drawn white with a dashed outline. */
  active?: boolean;
};

type TopBarProps = {
  role?: Role;
  menu?: MenuItem[];
  onLogOut?: () => void;
};

export function TopBar({ role, menu, onLogOut }: TopBarProps) {
  const { language } = useLanguage();
  return (
    <header className="topbar">
      <div className="topbar-brand">
        {/* The logo keeps its login colour (dark navy) on a pale tile, so it stands out. */}
        <span className="logo-tile">
          <Logo size={34} />
        </span>
        <div>
          <div className="topbar-name">{screenText('appName', language)}</div>
          {role ? <div className="topbar-role">{ROLE_LABELS[role][language]}</div> : null}
        </div>
      </div>
      {menu && menu.length > 0 ? (
        <nav className="topbar-menu" aria-label={screenText('menuName', language)}>
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={item.active ? 'menu-link menu-link-active' : 'menu-link'}
              aria-current={item.active ? 'page' : undefined}
            >
              {item.icon}
              {item.label}
              {item.count !== undefined && item.count > 0 ? (
                <span className="count-bubble">{localizeDigits(String(item.count), language)}</span>
              ) : null}
            </Link>
          ))}
        </nav>
      ) : null}
      <div className="topbar-right">
        {onLogOut ? (
          <button type="button" className="btn btn-small" onClick={onLogOut}>
            <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
            {screenText('logOut', language)}
          </button>
        ) : null}
        <LanguageSwitch />
      </div>
    </header>
  );
}
