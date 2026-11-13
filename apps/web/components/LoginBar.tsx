'use client';

// apps/web/components/LoginBar.tsx
//
// The small controls at the top of the login pages and the sign-up page. They are NOT in the
// login draft picture, but the website needs them, so they are kept small and soft (app/login.css):
//   - on the login pages, the two choices in the middle (Manager | Owner),
//   - on every one of these pages, the Settings button (the language choice) at the right.
// Owned by Mithi.

import { ROLE_LABELS } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';
import { screenText } from '../language/screenText';
import { SettingsMenu } from './SettingsMenu';

/** The two choices in the bar at the top: which kind of person is logging in. */
const LOGIN_TABS = [
  { role: 'manager', href: '/login' },
  { role: 'owner', href: '/owner-login' },
] as const;

/** Pass `activeRole` on a login page. Leave it out on the sign-up page. */
export function LoginBar({ activeRole }: { activeRole?: 'manager' | 'owner' }) {
  const { language } = useLanguage();
  return (
    <nav className="login-bar" aria-label={screenText('chooseRole', language)}>
      {activeRole ? (
        <div className="login-tabs">
          {LOGIN_TABS.map((tab) => (
            // A plain link (full page load) on purpose: each portal keeps its own
            // login storage name, which is chosen when the page loads (lib/backend.ts).
            <a
              key={tab.role}
              href={tab.href}
              className={tab.role === activeRole ? 'login-tab login-tab-active' : 'login-tab'}
              aria-current={tab.role === activeRole ? 'page' : undefined}
            >
              {ROLE_LABELS[tab.role][language]}
            </a>
          ))}
        </div>
      ) : null}
      <SettingsMenu />
    </nav>
  );
}
