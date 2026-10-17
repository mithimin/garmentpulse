'use client';

// apps/web/components/LoginBar.tsx
//
// The denim bar across the top of the login pages and the sign-up page.
// On the login pages it holds the two choices in the middle (Manager | Owner).
// On the sign-up page it shows the page title in the middle instead. The
// Settings button is always at the right end. Owned by Mithi.

import Link from 'next/link';
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
            <Link
              key={tab.role}
              href={tab.href}
              className={tab.role === activeRole ? 'login-tab login-tab-active' : 'login-tab'}
              aria-current={tab.role === activeRole ? 'page' : undefined}
            >
              {ROLE_LABELS[tab.role][language]}
            </Link>
          ))}
        </div>
      ) : (
        <div className="login-bar-title">{screenText('signupTitle', language)}</div>
      )}
      <SettingsMenu />
    </nav>
  );
}
