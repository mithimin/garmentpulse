// apps/web/language/greeting.ts
//
// Two small helpers for the greeting at the top of the manager and owner screens:
//   greetingKey(now)         which word to use: morning, afternoon or evening
//   formatToday(now, lang)   today's date, like "Friday 9 October" (or in Bangla)
// Owned by Mithi.

import type { Language } from '@garmentpulse/shared';
import { localizeDigits } from './format';

/** The screenText key for "Good morning", "Good afternoon" or "Good evening". */
export function greetingKey(now: Date): 'greetMorning' | 'greetAfternoon' | 'greetEvening' {
  const hour = now.getHours();
  if (hour < 12) return 'greetMorning';
  if (hour < 18) return 'greetAfternoon';
  return 'greetEvening';
}

/** "Friday 9 October" (or the Bangla version). */
export function formatToday(now: Date, language: Language): string {
  const text = new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);
  return localizeDigits(text, language);
}
