'use client';

// apps/web/components/ExpensePhoto.tsx
//
// One photo of a repair cost (the invoice or the receipt). The photos are private,
// so each time one is shown it asks for a fresh link that works for a few minutes
// (data/useExpenseData.ts). The link is never saved. A click makes the photo
// bigger or smaller. With fake data there is no photo, so a placeholder says so.
// Give it `key={path}` so a different photo starts again from "Loading...".
// Owned by Mithi.

import { useEffect, useState } from 'react';
import { ReceiptText } from 'lucide-react';
import { expensePhotoUrl } from '../data/useExpenseData';
import { useLanguage } from '../language/LanguageContext';
import { screenText } from '../language/screenText';
import { Button } from './Button';

type Photo =
  | { state: 'loading' }
  | { state: 'ready'; url: string }
  | { state: 'sample' }
  | { state: 'failed' };

export function ExpensePhoto({ label, path }: { label: string; path: string }) {
  const { language } = useLanguage();
  const [photo, setPhoto] = useState<Photo>({ state: 'loading' });
  const [big, setBig] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    expensePhotoUrl(path)
      .then((url) => {
        if (!cancelled) setPhoto(url ? { state: 'ready', url } : { state: 'sample' });
      })
      .catch(() => {
        if (!cancelled) setPhoto({ state: 'failed' });
      });
    return () => {
      cancelled = true;
    };
  }, [path, attempt]);

  function tryAgain() {
    setPhoto({ state: 'loading' });
    setAttempt((n) => n + 1);
  }

  return (
    <figure className={big ? 'photo photo-big' : 'photo'}>
      <figcaption>{label}</figcaption>
      {photo.state === 'ready' ? (
        <button
          type="button"
          className="photo-frame photo-button"
          aria-label={`${label}: ${screenText(big ? 'photoSmaller' : 'photoBigger', language)}`}
          aria-pressed={big}
          onClick={() => setBig(!big)}
        >
          {/* A private, short-lived link, so Next.js image tools cannot be used here. */}
          <img src={photo.url} alt={label} onError={() => setPhoto({ state: 'failed' })} />
        </button>
      ) : (
        <div className="photo-frame photo-empty">
          <ReceiptText size={30} strokeWidth={1.5} aria-hidden="true" />
          {photo.state === 'loading' ? <p>{screenText('loading', language)}</p> : null}
          {photo.state === 'sample' ? <p>{screenText('photoSample', language)}</p> : null}
          {photo.state === 'failed' ? (
            <>
              <p role="alert">{screenText('photoFailed', language)}</p>
              <Button small onClick={tryAgain}>
                {screenText('tryAgain', language)}
              </Button>
            </>
          ) : null}
        </div>
      )}
    </figure>
  );
}
