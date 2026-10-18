'use client';

// apps/web/app/manager/codes/page.tsx
//
// The manager's "Invite codes" page (docs/mvp.md 2.1 and docs/api-contract.md 4.7).
// A manager makes one-time invite codes for new WORKERS and TECHNICIANS (and only
// those: manager codes are the owner's job). Two buttons make a code; below them
// is the list of codes nobody has used yet, with the role each code gives and the
// day it stops working (7 days after it was made). Workers and technicians use
// the code to sign up on the phone app.
// FAKE data for now (auth/fakeAccounts.ts); it connects to `create_invite_code`
// and `list_invite_codes` when Sakib's backend is ready. In real mode the page
// only says that codes are not open yet. Owned by Mithi.

import { useEffect, useState } from 'react';
import { ROLE_LABELS } from '@garmentpulse/shared';
import { createInviteCode, listInviteCodes } from '../../../auth/fakeAccounts';
import type { InviteCode, InviteRole } from '../../../auth/fakeAccounts';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { useLanguage } from '../../../language/LanguageContext';
import { formatDateTime } from '../../../language/format';
import { screenText } from '../../../language/screenText';
import { backendIsReal } from '../../../lib/backend';

/** The codes a manager may make (and see): never manager codes. */
function myCodes(): InviteCode[] {
  return listInviteCodes().filter((c) => c.role === 'worker' || c.role === 'technician');
}

export default function ManagerCodesPage() {
  const { language } = useLanguage();
  const [codes, setCodes] = useState<InviteCode[]>([]);

  // Read the saved codes once the page is in the browser.
  useEffect(() => {
    setCodes(myCodes());
  }, []);

  function handleCreate(role: InviteRole) {
    createInviteCode(role);
    setCodes(myCodes());
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
        <h1>{screenText('menuInviteCodes', language)}</h1>
        <p className="greeting-line">{screenText('inviteCodesHelp', language)}</p>
      </div>
      <Card className="card-list">
        <div className="code-buttons">
          <Button kind="main" onClick={() => handleCreate('worker')}>
            {screenText('createWorkerCode', language)}
          </Button>
          <Button kind="main" onClick={() => handleCreate('technician')}>
            {screenText('createTechnicianCode', language)}
          </Button>
        </div>
        {codes.length === 0 ? (
          <p>{screenText('noCodes', language)}</p>
        ) : (
          <ul className="code-list">
            {codes.map((item) => (
              <li key={item.code}>
                <span className="code">{item.code}</span>
                <span className="code-note">
                  {ROLE_LABELS[item.role][language]} · {screenText('codeValidUntil', language)}{' '}
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
