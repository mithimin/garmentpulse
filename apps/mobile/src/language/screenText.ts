// apps/mobile/src/language/screenText.ts
//
// The words on this app's own screens, in English and Bangla: button names,
// field labels, and the friendly sentences for error codes.
// (Words for statuses, free/busy and roles do NOT go here. They come from
// `labels.ts` in @garmentpulse/shared, so the phone and the website agree.)
//
// DRAFT: the Bangla sentences below are a first suggestion and should be read by
// a Bangla speaker on the team before release.
// Owned by Rubaiya.

import type { ErrorCode, Language } from '@garmentpulse/shared';
import { UNKNOWN_ERROR } from '@garmentpulse/shared';

type Words = Record<Language, string>;

export const LOGIN_TEXT = {
  appName: { en: 'GarmentPulse', bn: 'গার্মেন্টপালস' },
  tagline: { en: 'For workers and technicians', bn: 'শ্রমিক ও টেকনিশিয়ানদের জন্য' },
  roleLabel: { en: 'I am a', bn: 'আমি একজন' },
  /** Shown when the chosen role (worker/technician) does not match the account. */
  roleMismatch: {
    en: 'This account is for the other role. Please choose the other button above.',
    bn: 'এই অ্যাকাউন্টটি অন্য ভূমিকার। অনুগ্রহ করে উপরের অন্য বোতামটি বেছে নিন।',
  },
  emailLabel: { en: 'Email', bn: 'ইমেইল' },
  emailHint: { en: 'name@example.com', bn: 'name@example.com' },
  passwordLabel: { en: 'Password', bn: 'পাসওয়ার্ড' },
  passwordHint: { en: 'Type your password', bn: 'আপনার পাসওয়ার্ড লিখুন' },
  loginButton: { en: 'Log in', bn: 'লগ ইন' },
  loading: { en: 'Loading…', bn: 'লোড হচ্ছে…' },
} satisfies Record<string, Words>;

export const HOME_TEXT = {
  signedInAs: { en: 'You are logged in as', bn: 'আপনি লগ ইন করেছেন' },
  comingSoon: { en: 'Your screens are coming soon.', bn: 'আপনার স্ক্রিনগুলো শীঘ্রই আসছে।' },
  logoutButton: { en: 'Log out', bn: 'লগ আউট' },
} satisfies Record<string, Words>;

/**
 * One friendly sentence for each error code, in both languages.
 * The app never shows a raw code like WRONG_PLATFORM to a person.
 */
export const ERROR_TEXT: Record<ErrorCode | typeof UNKNOWN_ERROR, Words> = {
  NOT_AUTHENTICATED: {
    en: 'We could not log you in. Check your email and password.',
    bn: 'আপনাকে লগ ইন করা গেল না। ইমেইল ও পাসওয়ার্ড দেখে নিন।',
  },
  WRONG_PLATFORM: {
    en: 'This phone app is for workers and technicians. Please use the website instead.',
    bn: 'এই ফোন অ্যাপ শ্রমিক ও টেকনিশিয়ানদের জন্য। অনুগ্রহ করে ওয়েবসাইট ব্যবহার করুন।',
  },
  NOT_ALLOWED: {
    en: 'You are not allowed to do this.',
    bn: 'আপনার এটি করার অনুমতি নেই।',
  },
  NOT_FOUND: {
    en: 'We could not find that.',
    bn: 'এটি খুঁজে পাওয়া যায়নি।',
  },
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
    en: 'Please accept the job first.',
    bn: 'আগে কাজটি গ্রহণ করুন।',
  },
  JOB_ALREADY_ACCEPTED: {
    en: 'You already accepted this job.',
    bn: 'আপনি এই কাজটি আগেই গ্রহণ করেছেন।',
  },
  INVALID_STATUS_CHANGE: {
    en: 'The status cannot be changed like that.',
    bn: 'স্ট্যাটাস এভাবে বদলানো যাবে না।',
  },
  UNKNOWN: {
    en: 'Something went wrong. Please try again.',
    bn: 'কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।',
  },
};
