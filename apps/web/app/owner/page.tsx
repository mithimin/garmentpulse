'use client';

// apps/web/app/owner/page.tsx
//
// The owner's start page. PLACEHOLDER for now: it only proves the login and
// the role door work. The one read-only screen (three count boxes and a list of
// all reports) comes in a later piece of work. Owned by Mithi.

import { RoleGate } from '../../auth/RoleGate';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/Card';
import { TopBar } from '../../components/TopBar';
import { useLanguage } from '../../language/LanguageContext';
import { screenText } from '../../language/screenText';

export default function OwnerPage() {
  return (
    <RoleGate role="owner">
      <OwnerContent />
    </RoleGate>
  );
}

function OwnerContent() {
  const { profile, logOut } = useAuth();
  const { language } = useLanguage();
  return (
    <>
      <TopBar role="owner" onLogOut={logOut} />
      <main className="page">
        <Card>
          <h1>
            {screenText('hello', language)}, {profile?.display_name}
          </h1>
          <p>{screenText('comingSoon', language)}</p>
        </Card>
      </main>
    </>
  );
}
