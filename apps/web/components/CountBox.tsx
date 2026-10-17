'use client';

// apps/web/components/CountBox.tsx
//
// One of the summary boxes at the top of a page (for example "Waiting: 3").
// The number is shown in Bangla digits when the language is Bangla. All text
// on the box is white (design system section 3.2 "number box").
// Owned by Mithi.

import { useLanguage } from '../language/LanguageContext';
import { localizeDigits } from '../language/format';

export function CountBox({ label, count }: { label: string; count: number }) {
  const { language } = useLanguage();
  return (
    <div className="count-box">
      <div className="count-number">{localizeDigits(String(count), language)}</div>
      <div className="count-label">{label}</div>
    </div>
  );
}
