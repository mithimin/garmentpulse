'use client';

// apps/web/components/StateMessage.tsx
//
// The three small messages that stop a page from ever being blank
// (design system section 12):
//   - LoadingMessage: "Loading..." while we wait for data
//   - EmptyMessage:   "Nothing here yet." when a list has no rows
//   - ErrorMessage:   a friendly sentence when something went wrong, with an
//                     optional "Try again" button
// Owned by Mithi.

import { useLanguage } from '../language/LanguageContext';
import { screenText } from '../language/screenText';
import { Button } from './Button';

export function LoadingMessage() {
  const { language } = useLanguage();
  return (
    <div className="state" role="status">
      {screenText('loading', language)}
    </div>
  );
}

export function EmptyMessage({ text }: { text?: string }) {
  const { language } = useLanguage();
  return <div className="state">{text ?? screenText('empty', language)}</div>;
}

export function ErrorMessage({ text, onRetry }: { text?: string; onRetry?: () => void }) {
  const { language } = useLanguage();
  return (
    <div className="state state-error" role="alert">
      <p>{text ?? screenText('somethingWrong', language)}</p>
      {onRetry ? <Button onClick={onRetry}>{screenText('tryAgain', language)}</Button> : null}
    </div>
  );
}
