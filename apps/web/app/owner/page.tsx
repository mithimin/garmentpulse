'use client';

// apps/web/app/owner/page.tsx
//
// The owner's start page. For now it holds the "Manager codes" box: the owner
// presses a button to create a one-time code (OTP) and gives it to a new manager,
// who needs it to sign up. The codes are FAKE for now (see auth/fakeAccounts.ts).
// The one read-only screen (three count boxes and a list of all reports) comes in
// a later piece of work. Owned by Mithi.

import { useEffect, useState } from 'react';
import { RoleGate } from '../../auth/RoleGate';
import { useAuth } from '../../auth/AuthContext';
import { createManagerCode, listManagerCodes } from '../../auth/fakeAccounts';
import type { ManagerCode } from '../../auth/fakeAccounts';
import { Button } from '../../components/Button';
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
  const [codes, setCodes] = useState<ManagerCode[]>([]);

  // Read the saved codes once the page is in the browser.
  useEffect(() => {
    setCodes(listManagerCodes());
  }, []);

  function handleCreateCode() {
    createManagerCode();
    setCodes(listManagerCodes());
  }

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
        <Card>
          <h2>{screenText('codesTitle', language)}</h2>
          <p>{screenText('codesHelp', language)}</p>
          <Button kind="main" onClick={handleCreateCode}>
            {screenText('createCode', language)}
          </Button>
          {codes.length === 0 ? (
            <p>{screenText('noCodes', language)}</p>
          ) : (
            <ul className="code-list">
              {codes.map((item) => (
                <li key={item.code} className="code">
                  {item.code}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>
    </>
  );
}
