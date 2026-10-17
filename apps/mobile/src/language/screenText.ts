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

/** Words on the worker screens (tabs, report form, report list and detail). */
export const WORKER_TEXT = {
  tabHome: { en: 'Home', bn: 'হোম' },
  tabReport: { en: 'Report', bn: 'রিপোর্ট' },
  tabMyReports: { en: 'My reports', bn: 'আমার রিপোর্ট' },

  homeHello: { en: 'Hello', bn: 'হ্যালো' },
  homeIntro: {
    en: 'If a machine is broken, tell us here. A technician will be sent to fix it.',
    bn: 'কোনো মেশিন নষ্ট হলে এখানে জানান। ঠিক করতে একজন টেকনিশিয়ান পাঠানো হবে।',
  },
  homeReportButton: { en: 'Report a problem', bn: 'সমস্যা জানান' },
  homeLatestTitle: { en: 'Your latest report', bn: 'আপনার সর্বশেষ রিপোর্ট' },
  homeNoReports: {
    en: 'You have not reported anything yet.',
    bn: 'আপনি এখনো কোনো রিপোর্ট করেননি।',
  },
  logoutButton: { en: 'Log out', bn: 'লগ আউট' },

  reportTitle: { en: 'Report a problem', bn: 'সমস্যা জানান' },
  machineLabel: { en: 'Which machine?', bn: 'কোন মেশিন?' },
  machineHint: { en: 'Choose a machine', bn: 'একটি মেশিন বেছে নিন' },
  machineMissing: { en: 'Choose a machine first.', bn: 'আগে একটি মেশিন বেছে নিন।' },
  descriptionLabel: { en: 'What is wrong?', bn: 'সমস্যাটি কী?' },
  descriptionHint: {
    en: 'For example: the needle keeps breaking',
    bn: 'যেমন: সুই বারবার ভেঙে যাচ্ছে',
  },
  descriptionMissing: {
    en: 'Write a few words about the problem.',
    bn: 'সমস্যাটি নিয়ে কয়েকটি কথা লিখুন।',
  },
  descriptionTooLong: {
    en: 'This is too long. Please use 500 letters or fewer.',
    bn: 'লেখাটি খুব বড়। ৫০০ অক্ষর বা তার কম লিখুন।',
  },
  sendButton: { en: 'Send report', bn: 'রিপোর্ট পাঠান' },
  sending: { en: 'Sending…', bn: 'পাঠানো হচ্ছে…' },
  sentTitle: { en: 'Report sent', bn: 'রিপোর্ট পাঠানো হয়েছে' },
  sentBody: {
    en: 'The manager can now see it. You can follow it in My reports.',
    bn: 'ম্যানেজার এখন এটি দেখতে পারবেন। আমার রিপোর্ট-এ এর অবস্থা দেখুন।',
  },
  sentViewButton: { en: 'See my reports', bn: 'আমার রিপোর্ট দেখুন' },
  sentAnotherButton: { en: 'Report another problem', bn: 'আরেকটি সমস্যা জানান' },
  closeButton: { en: 'Close', bn: 'বন্ধ করুন' },

  myReportsTitle: { en: 'My reports', bn: 'আমার রিপোর্ট' },
  myReportsEmpty: { en: 'You have no reports yet.', bn: 'আপনার এখনো কোনো রিপোর্ট নেই।' },
  detailTitle: { en: 'Report details', bn: 'রিপোর্টের বিবরণ' },
  back: { en: 'Back', bn: 'ফিরে যান' },
  problemLabel: { en: 'Problem', bn: 'সমস্যা' },
  reportedAtLabel: { en: 'Reported', bn: 'জানানো হয়েছে' },
  technicianLabel: { en: 'Technician', bn: 'টেকনিশিয়ান' },
  noTechnicianYet: {
    en: 'Nobody is assigned yet. Your report is waiting in the queue.',
    bn: 'এখনো কাউকে দেওয়া হয়নি। আপনার রিপোর্ট সারিতে অপেক্ষা করছে।',
  },
  progressLabel: { en: 'Progress', bn: 'অগ্রগতি' },
  loadingList: { en: 'Loading…', bn: 'লোড হচ্ছে…' },
} satisfies Record<string, Words>;

/** Words on the technician screens (tabs, job list, job page, history). */
export const TECH_TEXT = {
  tabJobs: { en: 'Jobs', bn: 'কাজ' },
  tabHistory: { en: 'History', bn: 'ইতিহাস' },

  jobsTitle: { en: 'My jobs', bn: 'আমার কাজ' },
  historyTitle: { en: 'Past jobs', bn: 'আগের কাজ' },
  jobTitle: { en: 'Job details', bn: 'কাজের বিবরণ' },

  youAre: { en: 'You are', bn: 'আপনি এখন' },
  freeHint: {
    en: 'No open job. Waiting for the manager.',
    bn: 'কোনো খোলা কাজ নেই। ম্যানেজারের অপেক্ষায়।',
  },
  busyHint: { en: 'You have a job to finish.', bn: 'আপনার একটি কাজ শেষ করা বাকি।' },
  noJobs: { en: 'You have no open jobs right now.', bn: 'এখন আপনার কোনো খোলা কাজ নেই।' },
  noHistory: { en: 'You have no finished jobs yet.', bn: 'আপনার এখনো কোনো শেষ করা কাজ নেই।' },
  needsAccept: { en: 'New: please accept', bn: 'নতুন: গ্রহণ করুন' },
  logoutButton: { en: 'Log out', bn: 'লগ আউট' },

  reportedByLabel: { en: 'Reported by', bn: 'জানিয়েছেন' },
  problemLabel: { en: 'Problem', bn: 'সমস্যা' },
  reportedAtLabel: { en: 'Reported', bn: 'জানানো হয়েছে' },
  acceptedAtLabel: { en: 'Accepted', bn: 'গ্রহণ করা হয়েছে' },
  notAcceptedYet: { en: 'Not accepted yet', bn: 'এখনো গ্রহণ করা হয়নি' },
  progressLabel: { en: 'Progress', bn: 'অগ্রগতি' },

  acceptButton: { en: 'Accept job', bn: 'কাজটি গ্রহণ করুন' },
  startButton: { en: 'Start work', bn: 'কাজ শুরু করুন' },
  fixedButton: { en: 'Mark as fixed', bn: 'ঠিক হয়েছে' },
  working: { en: 'Saving…', bn: 'সংরক্ষণ হচ্ছে…' },
  doneNote: { en: 'This job is finished. Well done!', bn: 'কাজটি শেষ হয়েছে। চমৎকার!' },
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
