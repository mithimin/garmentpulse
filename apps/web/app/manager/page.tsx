'use client';

// apps/web/app/manager/page.tsx
//
// The manager's start page. PLACEHOLDER for now: it only proves the login and
// the role door work. The live report list, free/busy technicians and the
// assign button come in the next piece of work. Owned by Mithi.

import { RoleGate } from '../../auth/RoleGate';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/Card';
import { TopBar } from '../../components/TopBar';
import { useLanguage } from '../../language/LanguageContext';
import { screenText } from '../../language/screenText';

export default function ManagerPage() {
  return (
    <RoleGate role="manager">
      <ManagerContent />
    </RoleGate>
  );
}

function ManagerContent() {
  const { profile, logOut } = useAuth();
  const { language } = useLanguage();
  return (
    <>
      <TopBar role="manager" onLogOut={logOut} />
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
