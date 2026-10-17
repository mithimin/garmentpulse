'use client';

// apps/web/auth/RoleGate.tsx
//
// A door for a page. Put it around a page that only one role may see.
//   - Nobody logged in: sends the person to /login.
//   - Wrong role (for example the owner typing the manager address): shows a
//     "You cannot open this page" message instead of the page.
// This is only a polite door. The real lock is in the backend (CLAUDE.md:
// the database is the security guard). Owned by Mithi.

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { Role } from '@garmentpulse/shared';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LoadingMessage } from '../components/StateMessage';
import { TopBar } from '../components/TopBar';
import { useLanguage } from '../language/LanguageContext';
import { screenText } from '../language/screenText';
import { useAuth } from './AuthContext';
import { homePathFor, loginPathFor } from './homePath';

export function RoleGate({ role, children }: { role: Role; children: ReactNode }) {
  const { profile, ready, logOut } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (ready && !profile) router.replace(loginPathFor(role));
  }, [ready, profile, router, role]);

  if (!ready || !profile) {
    return (
      <main className="page">
        <LoadingMessage />
      </main>
    );
  }

  if (profile.role !== role) {
    return (
      <>
        <TopBar role={profile.role} onLogOut={logOut} />
        <main className="page">
          <Card>
            <h1>{screenText('notAllowedTitle', language)}</h1>
            <p>{screenText('notAllowedText', language)}</p>
            <Button kind="main" onClick={() => router.replace(homePathFor(profile.role))}>
              {screenText('goToStart', language)}
            </Button>
          </Card>
        </main>
      </>
    );
  }

  return <>{children}</>;
}
