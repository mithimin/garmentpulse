'use client';

// apps/web/components/TopBar.tsx
//
// The bar along the top of every page: logo and name on the left, the role name
// under it, and on the right the language switch and (when someone is logged in)
// a "Log out" button. A dashed stitch line runs along its bottom edge
// (design system section 9.5). The owner's page has no menu links, so this bar
// has none either for now. Pass `role` to show the role name; pass `onLogOut`
// to show the Log out button.
// Owned by Mithi.

import { LogOut } from 'lucide-react';
import type { Role } from '@garmentpulse/shared';
import { ROLE_LABELS } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';
import { screenText } from '../language/screenText';
import { LanguageSwitch } from './LanguageSwitch';
import { Logo } from './Logo';

export function TopBar({ role, onLogOut }: { role?: Role; onLogOut?: () => void }) {
  const { language } = useLanguage();
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <Logo size={40} light />
        <div>
          <div className="topbar-name">{screenText('appName', language)}</div>
          {role ? <div className="topbar-role">{ROLE_LABELS[role][language]}</div> : null}
        </div>
      </div>
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
