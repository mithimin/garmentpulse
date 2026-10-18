// apps/web/language/greeting.ts
//
// A small helper for the greeting at the top of the manager and owner screens:
//   formatToday(now, lang)   today's date, like "Friday 9 October" (or in Bangla)
// The greeting words themselves ("Have a good day") are the screenText key `greetDay`.
// They are the same all day, so no time-of-day helper is needed.
// Owned by Mithi.

import type { Language } from '@garmentpulse/shared';
import { localizeDigits } from './format';

/** "Friday 9 October" (or the Bangla version). */
export function formatToday(now: Date, language: Language): string {
  const text = new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);
  return localizeDigits(text, language);
}
