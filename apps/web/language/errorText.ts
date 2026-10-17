// apps/web/language/errorText.ts
//
// Friendly sentences for every error code in docs/api-contract.md, in English and
// Bangla. The website never shows a raw code like WRONG_PLATFORM to a person.
// DRAFT: the Bangla words are a first try and need a Bangla speaker to read them.
// Owned by Mithi.

import type { ErrorCode, Language } from '@garmentpulse/shared';
import { isErrorCode, UNKNOWN_ERROR } from '@garmentpulse/shared';

type Words = Record<Language, string>;

export const ERROR_TEXT: Record<ErrorCode | typeof UNKNOWN_ERROR, Words> = {
  NOT_AUTHENTICATED: {
    en: 'We could not sign you in. Check your email and password.',
    bn: 'আপনাকে লগ ইন করা গেল না। ইমেইল ও পাসওয়ার্ড দেখে নিন।',
  },
  WRONG_PLATFORM: {
    en: 'This website is for managers and the owner. Please use the phone app instead.',
    bn: 'এই ওয়েবসাইট ম্যানেজার ও মালিকের জন্য। অনুগ্রহ করে ফোন অ্যাপ ব্যবহার করুন।',
  },
  NOT_ALLOWED: {
    en: 'You are not allowed to do this.',
    bn: 'আপনার এটি করার অনুমতি নেই।',
  },
  NOT_FOUND: { en: 'We could not find that.', bn: 'এটি খুঁজে পাওয়া যায়নি।' },
  INVALID_INPUT: {
    en: 'Please type your email and password.',
    bn: 'অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড লিখুন।',
  },
  TECHNICIAN_BUSY: {
    en: 'That technician is busy with another job.',
    bn: 'ওই টেকনিশিয়ান অন্য কাজে ব্যস্ত।',
  },
  REPORT_ALREADY_ASSIGNED: {
    en: 'This report already has a technician.',
    bn: 'এই রিপোর্টে আগেই একজন টেকনিশিয়ান আছেন।',
  },
  JOB_NOT_ACCEPTED: {
    en: 'The technician must accept the job first.',
    bn: 'আগে টেকনিশিয়ানকে কাজটি গ্রহণ করতে হবে।',
  },
  JOB_ALREADY_ACCEPTED: {
    en: 'The technician already accepted this job.',
    bn: 'টেকনিশিয়ান এই কাজটি আগেই গ্রহণ করেছেন।',
  },
  INVALID_STATUS_CHANGE: {
    en: 'The status cannot be changed like that.',
    bn: 'স্ট্যাটাস এভাবে বদলানো যাবে না।',
  },
  [UNKNOWN_ERROR]: {
    en: 'Something went wrong. Please try again.',
    bn: 'কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।',
  },
};

/** Turns an error from a backend call into a friendly sentence. */
export function errorSentence(error: unknown, language: Language): string {
  const message = error instanceof Error ? error.message : '';
  return ERROR_TEXT[isErrorCode(message) ? message : UNKNOWN_ERROR][language];
}
