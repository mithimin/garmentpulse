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
// When a page has a sidebar (`onToggleSidebar`), Log out lives at the bottom of the
// sidebar instead, so the bar does not show it twice.
// Owned by Mithi.

import { LogOut, Menu } from 'lucide-react';
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

/** A loose cream thread with two loops, ending at a spool: pure decoration (hidden on small screens). */
function TopBarThread() {
  return (
    <span className="topbar-thread" aria-hidden="true">
      <svg viewBox="0 0 420 88" width="420" height="88" fill="none">
        <path
          d="M0 66 C60 66 110 60 150 52 C175 47 200 44 216 54 C226 62 218 72 206 68 C194 63 200 48 220 42 C250 33 262 60 288 62 C318 64 340 50 372 44 C384 41 398 42 408 48"
          stroke="#e6d8cf"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <g transform="translate(398 6)">
          <rect x="2" y="0" width="34" height="7" rx="2" fill="#b8b0a6" />
          <rect x="2" y="76" width="34" height="6" rx="2" fill="#b8b0a6" />
          <rect x="5" y="7" width="28" height="69" rx="3" fill="#7a4a5a" />
          <path
            d="M5 14 L33 22 M5 26 L33 34 M5 38 L33 46 M5 50 L33 58 M5 62 L33 70"
            stroke="#9a6a7a"
            strokeWidth="3"
          />
        </g>
      </svg>
    </span>
  );
}

export function TopBar({ role, onLogOut, onToggleSidebar, sidebarOpen = false }: TopBarProps) {
  const { language } = useLanguage();
  return (
    <header className={onToggleSidebar ? 'topbar topbar-has-sidebar' : 'topbar'}>
      <div className="topbar-left">
        {onToggleSidebar ? (
          <button
            type="button"
            className="icon-btn"
            data-sidebar-toggle="true"
            aria-label={screenText('sidebarToggle', language)}
            aria-expanded={sidebarOpen}
            onClick={onToggleSidebar}
          >
            <Menu size={26} strokeWidth={2.2} aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <div className="topbar-brand">
        {/* The logo keeps its login colour (dark navy) on a pale tile, so it stands out. */}
        <span className="logo-tile">
          <Logo size={34} />
        </span>
        <div className="topbar-nameplate">
          <div className="topbar-name">{screenText('appName', language)}</div>
          {role ? <div className="topbar-role">{ROLE_LABELS[role][language]}</div> : null}
        </div>
      </div>
      <div className="topbar-right">
        <TopBarThread />
        {onLogOut && !onToggleSidebar ? (
          <button
            type="button"
            className="btn btn-small"
            aria-label={screenText('logOut', language)}
            onClick={onLogOut}
          >
            <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
            <span className="btn-label">{screenText('logOut', language)}</span>
          </button>
        ) : null}
        <LanguageSwitch />
      </div>
    </header>
  );
}
