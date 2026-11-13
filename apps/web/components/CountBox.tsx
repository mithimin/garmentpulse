'use client';

// apps/web/components/CountBox.tsx
//
// One of the boxes at the top of a screen (design system 3.2, "number box").
// It is a rounded box (brown, cream, baby blue, cream, as in the factory-look picture) with
// a big faint icon in the top-right corner:
//   - a small spaced-out CAPITAL label at the top,
//   - a big number,
//   - (optional) a small tag under the number with one more fact, for example
//     "2 waiting for a technician". `tone` picks the tag colour.
// The number may be a number or a short text. Digits turn into Bangla digits in
// Bangla mode. Owned by Mithi.

import { CircleCheck, Clock, TriangleAlert, UserRound } from 'lucide-react';
import { useLanguage } from '../language/LanguageContext';
import { localizeDigits } from '../language/format';

type CountBoxProps = {
  label: string;
  count: number | string;
  tag?: string;
  tone?: 'plain' | 'waiting' | 'progress' | 'resolved' | 'free';
};

const TONE_ICON = {
  plain: TriangleAlert,
  waiting: TriangleAlert,
  progress: Clock,
  resolved: CircleCheck,
  free: UserRound,
};

export function CountBox({ label, count, tag, tone = 'plain' }: CountBoxProps) {
  const { language } = useLanguage();
  const Icon = TONE_ICON[tone];
  return (
    <div className="count-box">
      <Icon className="count-icon" size={58} strokeWidth={1.6} aria-hidden="true" />
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
