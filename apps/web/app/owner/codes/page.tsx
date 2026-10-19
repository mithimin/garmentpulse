'use client';

// apps/web/app/owner/codes/page.tsx
//
// The owner's "Manager codes" page (docs/mvp.md 2.5 and 2.1). One button makes a
// one-time invite code for a new MANAGER (the owner may only make manager codes,
// docs/api-contract.md 4.7). Below it is the list of codes nobody has used yet,
// with the day each one stops working (7 days after it was made).
// FAKE data for now (auth/fakeAccounts.ts); it connects to `create_invite_code`
// and `list_invite_codes` when Sakib's backend is ready. In real mode the page
// only says that codes are not open yet. Owned by Mithi.

import { useEffect, useState } from 'react';
import { createInviteCode, listInviteCodes } from '../../../auth/fakeAccounts';
import type { InviteCode } from '../../../auth/fakeAccounts';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { useLanguage } from '../../../language/LanguageContext';
import { formatDateTime } from '../../../language/format';
import { screenText } from '../../../language/screenText';
import { backendIsReal } from '../../../lib/backend';

export default function OwnerCodesPage() {
  const { language } = useLanguage();
  const [codes, setCodes] = useState<InviteCode[]>([]);

  // Read the saved codes once the page is in the browser.
  useEffect(() => {
    setCodes(listInviteCodes().filter((c) => c.role === 'manager'));
  }, []);

  function handleCreateCode() {
    createInviteCode('manager');
    setCodes(listInviteCodes().filter((c) => c.role === 'manager'));
  }

  if (backendIsReal) {
    return (
      <Card>
        <h1>{screenText('signupClosedTitle', language)}</h1>
        <p>{screenText('signupClosedText', language)}</p>
      </Card>
    );
  }

  return (
    <>
      <div className="greeting">
        <h1>{screenText('codesTitle', language)}</h1>
        <p className="greeting-line">{screenText('codesHelp', language)}</p>
      </div>
      <Card className="card-list code-card">
        <Button kind="main" onClick={handleCreateCode}>
          {screenText('createCode', language)}
        </Button>
        {codes.length === 0 ? (
          <p>{screenText('noCodes', language)}</p>
        ) : (
          <ul className="code-list">
            {codes.map((item) => (
              <li key={item.code}>
                <span className="code">{item.code}</span>
                <span className="code-note">
                  {screenText('codeValidUntil', language)}{' '}
                  {formatDateTime(item.expires_at, language)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
