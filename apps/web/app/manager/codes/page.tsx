'use client';

// apps/web/app/manager/codes/page.tsx
//
// The manager's "Invite codes" page (docs/mvp.md 2.1 and docs/api-contract.md 4.7).
// A manager makes one-time invite codes for new WORKERS and TECHNICIANS (and only
// those: manager codes are the owner's job). There are TWO cards, one for worker
// codes and one for technician codes. Each card has its own button and its own
// list of codes nobody has used yet, with the day each one stops working (7 days
// after it was made). Workers and technicians use the code to sign up on the
// phone app.
// It uses `create_invite_code` and `list_invite_codes` on the real backend, or the
// fake codes when no backend is connected (auth/inviteCodes.ts). Owned by Mithi.

import { useEffect, useState } from 'react';
import type { InviteCode, InviteRole } from '@garmentpulse/shared';
import { makeCode, myUnusedCodes } from '../../../auth/inviteCodes';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { errorSentence } from '../../../language/errorText';
import { useLanguage } from '../../../language/LanguageContext';
import { formatDateTime } from '../../../language/format';
import { screenText } from '../../../language/screenText';

/** The codes a manager may make (and see): never manager codes. */
function onlyMine(list: InviteCode[]): InviteCode[] {
  return list.filter((c) => c.role === 'worker' || c.role === 'technician');
}

export default function ManagerCodesPage() {
  const { language } = useLanguage();
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [errorText, setErrorText] = useState('');
  const [busy, setBusy] = useState(false);

  // Read the codes once the page is in the browser.
  useEffect(() => {
    myUnusedCodes()
      .then((list) => setCodes(onlyMine(list)))
      .catch((error) => setErrorText(errorSentence(error, language)));
  }, [language]);

  async function handleCreate(role: InviteRole) {
    setBusy(true);
    setErrorText('');
    try {
      await makeCode(role);
      setCodes(onlyMine(await myUnusedCodes()));
    } catch (error) {
      setErrorText(errorSentence(error, language));
    }
    setBusy(false);
  }

  return (
    <>
      <div className="greeting">
        <h1>{screenText('menuInviteCodes', language)}</h1>
        <p className="greeting-line">{screenText('inviteCodesHelp', language)}</p>
      </div>
      {errorText ? (
        <p className="field-error" role="alert">
          {errorText}
        </p>
      ) : null}
      <div className="code-cards">
        <CodeCard
          title={screenText('workerCodesTitle', language)}
          buttonLabel={screenText('createWorkerCode', language)}
          codes={codes.filter((c) => c.role === 'worker')}
          busy={busy}
          onCreate={() => handleCreate('worker')}
        />
        <CodeCard
          title={screenText('technicianCodesTitle', language)}
          buttonLabel={screenText('createTechnicianCode', language)}
          codes={codes.filter((c) => c.role === 'technician')}
          busy={busy}
          onCreate={() => handleCreate('technician')}
        />
      </div>
    </>
  );
}

/** One card: a title, a button that makes a code, and the unused codes of that kind. */
function CodeCard(props: {
  title: string;
  buttonLabel: string;
  codes: InviteCode[];
  busy: boolean;
  onCreate: () => void;
}) {
  const { language } = useLanguage();
  return (
    <Card className="card-list">
      <h2>{props.title}</h2>
      <Button kind="main" onClick={props.onCreate} disabled={props.busy}>
        {props.buttonLabel}
      </Button>
      {props.codes.length === 0 ? (
        <p>{screenText('noCodes', language)}</p>
      ) : (
        <ul className="code-list">
          {props.codes.map((item) => (
            <li key={item.code}>
              <span className="code">{item.code}</span>
              <span className="code-note">
                {screenText('codeValidUntil', language)} {formatDateTime(item.expires_at, language)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
