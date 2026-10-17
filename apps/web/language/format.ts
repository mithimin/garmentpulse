// apps/web/language/format.ts
//
// Small helpers that write numbers and times the way the chosen language needs
// them. In Bangla mode, digits become Bangla digits (০১২৩৪৫৬৭৮৯), for example
// "10:42" becomes "১০:৪২" (design system section 6). IDs such as "C-2041" must
// NEVER go through these helpers: they stay in English in both languages.
// Owned by Mithi.

import type { Language } from '@garmentpulse/shared';

const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/** Turns the digits 0-9 inside a text into Bangla digits when the language is Bangla. */
export function localizeDigits(text: string, language: Language): string {
  if (language === 'en') return text;
  return text.replace(/[0-9]/g, (digit) => BANGLA_DIGITS[Number(digit)] ?? digit);
}

const two = (n: number) => String(n).padStart(2, '0');

/** Writes a date and time like "17/10 · 08:05" (day/month, then hours:minutes). */
export function formatDateTime(isoDate: string, language: Language): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  const text = `${two(date.getDate())}/${two(date.getMonth() + 1)} · ${two(date.getHours())}:${two(date.getMinutes())}`;
  return localizeDigits(text, language);
}
