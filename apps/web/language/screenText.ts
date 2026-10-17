// apps/web/language/screenText.ts
//
// Words that belong to the website only (button names, short messages), in
// English and Bangla. Words for statuses, free/busy and roles do NOT go here:
// they come from `labels.ts` in @garmentpulse/shared.
// DRAFT: the Bangla words are a first try and need a Bangla speaker to read them.
// Owned by Mithi.

import type { Language } from '@garmentpulse/shared';

export const SCREEN_TEXT = {
  appName: { en: 'GarmentPulse', bn: 'গার্মেন্টপালস' },
  logOut: { en: 'Log out', bn: 'লগ আউট' },
  loading: { en: 'Loading...', bn: 'লোড হচ্ছে...' },
  empty: { en: 'Nothing here yet.', bn: 'এখানে এখনো কিছু নেই।' },
  somethingWrong: {
    en: 'Something went wrong. Please try again.',
    bn: 'কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।',
  },
  tryAgain: { en: 'Try again', bn: 'আবার চেষ্টা করুন' },
  languageSwitchName: { en: 'Change language', bn: 'ভাষা বদলান' },
  notFoundTitle: { en: 'Page not found', bn: 'পেজটি পাওয়া যায়নি' },
  notFoundText: {
    en: 'We could not find this page. The address may be wrong.',
    bn: 'এই পেজটি খুঁজে পাওয়া যায়নি। ঠিকানাটি ভুল হতে পারে।',
  },
  goToStart: { en: 'Go to the start', bn: 'শুরুতে ফিরে যান' },
  notAllowedTitle: { en: 'You cannot open this page', bn: 'আপনি এই পেজ খুলতে পারবেন না' },
  notAllowedText: {
    en: 'Your account is not allowed to see this page.',
    bn: 'আপনার অ্যাকাউন্টের এই পেজ দেখার অনুমতি নেই।',
  },
} as const satisfies Record<string, Record<Language, string>>;

export type ScreenTextKey = keyof typeof SCREEN_TEXT;

/** Finds one website word in the chosen language. */
export function screenText(key: ScreenTextKey, language: Language): string {
  return SCREEN_TEXT[key][language];
}
