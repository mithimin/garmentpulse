'use client';

// apps/web/components/TopBar.tsx
//
// The denim bar along the top of every page after login (design system 9.5):
//   - left:   a button that opens and closes the sidebar (only when a page passes
//             `onToggleSidebar`; the owner's one-screen page has no sidebar),
//   - middle: the nameplate: the logo, the app name and the role name,
//   - right:  the language switch and (when someone is logged in) a Log out button.
// A dashed gold stitch line runs along the bottom edge. The menu links live in
// the sidebar (components/Sidebar.tsx), not here.
// Pass `role` to show the role name; pass `onLogOut` to show the Log out button.
// Owned by Mithi.

import { LogOut, PanelLeft } from 'lucide-react';
import type { Role } from '@garmentpulse/shared';
import { ROLE_LABELS } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';
import { screenText } from '../language/screenText';
import { LanguageSwitch } from './LanguageSwitch';
import { Logo } from './Logo';

type TopBarProps = {
  role?: Role;
  onLogOut?: () => void;
  /** Shows the sidebar button on the left. */
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
};

export function TopBar({ role, onLogOut, onToggleSidebar, sidebarOpen = false }: TopBarProps) {
  const { language } = useLanguage();
  return (
    <header className={onToggleSidebar ? 'topbar topbar-has-sidebar' : 'topbar'}>
      <div className="topbar-left">
        {onToggleSidebar ? (
          <button
            type="button"
            className="icon-btn"
            aria-label={screenText('sidebarToggle', language)}
            aria-expanded={sidebarOpen}
            onClick={onToggleSidebar}
          >
            <PanelLeft size={22} strokeWidth={1.8} aria-hidden="true" />
          </button>
        ) : null}
      </div>
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
