'use client';

// apps/web/components/CountBox.tsx
//
// One of the boxes at the top of a screen (design system 3.2, "number box").
// It is slate blue with a quilted pattern and a dashed stitch line inside the edge:
//   - a small spaced-out CAPITAL label at the top,
//   - a big number,
//   - (optional) a small tag under the number with one more fact, for example
//     "2 waiting for a technician". `tone` picks the tag colour.
// The number may be a number or a short text. Digits turn into Bangla digits in
// Bangla mode. Owned by Mithi.

import { useLanguage } from '../language/LanguageContext';
import { localizeDigits } from '../language/format';

type CountBoxProps = {
  label: string;
  count: number | string;
  tag?: string;
  tone?: 'plain' | 'green' | 'blue';
};

export function CountBox({ label, count, tag, tone = 'plain' }: CountBoxProps) {
  const { language } = useLanguage();
  return (
    <div className="count-box">
      <div className="count-label">{label}</div>
      <div className="count-number">{localizeDigits(String(count), language)}</div>
      {tag ? (
        <span className={`count-tag count-tag-${tone}`}>{tag}</span>
      ) : (
        <span className="count-tag-space" />
      )}
    </div>
  );
}
