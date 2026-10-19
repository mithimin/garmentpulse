'use client';

// apps/web/app/owner/codes/page.tsx
//
// The owner's "Manager codes" page (docs/mvp.md 2.5 and 2.1). One button makes a
// one-time invite code for a new MANAGER (the owner may only make manager codes,
// docs/api-contract.md 4.7). Below it is the list of codes nobody has used yet,
// with the day each one stops working (7 days after it was made).
// It uses `create_invite_code` and `list_invite_codes` on the real backend, or the
// fake codes when no backend is connected (auth/inviteCodes.ts). Owned by Mithi.

import { useEffect, useState } from 'react';
import type { InviteCode } from '@garmentpulse/shared';
import { makeCode, myUnusedCodes } from '../../../auth/inviteCodes';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { errorSentence } from '../../../language/errorText';
import { useLanguage } from '../../../language/LanguageContext';
import { formatDateTime } from '../../../language/format';
import { screenText } from '../../../language/screenText';

/** The owner only makes (and sees) manager codes. */
function onlyManagerCodes(list: InviteCode[]): InviteCode[] {
  return list.filter((c) => c.role === 'manager');
}

export default function OwnerCodesPage() {
  const { language } = useLanguage();
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [errorText, setErrorText] = useState('');
  const [busy, setBusy] = useState(false);

  // Read the codes once the page is in the browser.
  useEffect(() => {
    myUnusedCodes()
      .then((list) => setCodes(onlyManagerCodes(list)))
      .catch((error) => setErrorText(errorSentence(error, language)));
  }, [language]);

  async function handleCreateCode() {
    setBusy(true);
    setErrorText('');
    try {
      await makeCode('manager');
      setCodes(onlyManagerCodes(await myUnusedCodes()));
    } catch (error) {
      setErrorText(errorSentence(error, language));
    }
    setBusy(false);
  }

  return (
    <>
      <div className="greeting">
        <h1>{screenText('codesTitle', language)}</h1>
        <p className="greeting-line">{screenText('codesHelp', language)}</p>
      </div>
      <Card className="card-list code-card">
        <Button kind="main" onClick={handleCreateCode} disabled={busy}>
          {screenText('createCode', language)}
        </Button>
        {errorText ? (
          <p className="field-error" role="alert">
            {errorText}
          </p>
        ) : null}
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
