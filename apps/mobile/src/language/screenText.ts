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

import type { ApiErrorCode, ErrorCode, Language, Role } from '@garmentpulse/shared';
import { ROLE_LABELS, UNKNOWN_ERROR } from '@garmentpulse/shared';

type Words = Record<Language, string>;

export const LOGIN_TEXT = {
  appName: { en: 'GarmentPulse', bn: 'গার্মেন্টপালস' },
  /** The app name in two parts, so "Pulse" can be drawn in blue on the login screen. */
  appNameFirst: { en: 'Garment', bn: 'গার্মেন্ট' },
  appNameSecond: { en: 'Pulse', bn: 'পালস' },
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
  /** The link under the login button that opens the sign-up screen. */
  noAccount: { en: 'New here?', bn: 'নতুন?' },
  goToSignUp: { en: 'Sign up with a code', bn: 'কোড দিয়ে সাইন আপ করুন' },
  /** The small word between the login button and the sign-up link. */
  or: { en: 'or', bn: 'অথবা' },
  /** The line at the bottom of the login card (draft Bangla, needs a Bangla speaker). */
  secure: { en: 'Secure & Confidential', bn: 'নিরাপদ ও গোপনীয়' },
  showPassword: { en: 'Show password', bn: 'পাসওয়ার্ড দেখান' },
  hidePassword: { en: 'Hide password', bn: 'পাসওয়ার্ড লুকান' },
} satisfies Record<string, Words>;

/** Words on the sign-up screen (name, email, password and invite code). */
export const SIGNUP_TEXT = {
  title: { en: 'Create your account', bn: 'আপনার অ্যাকাউন্ট খুলুন' },
  intro: {
    en: 'Ask your manager for an invite code, then choose Worker or Technician to match the code.',
    bn: 'আপনার ম্যানেজারের কাছ থেকে একটি কোড নিন, তারপর কোডের সাথে মিলিয়ে শ্রমিক বা টেকনিশিয়ান বেছে নিন।',
  },
  nameLabel: { en: 'Full name', bn: 'পুরো নাম' },
  nameHint: { en: 'Type your full name', bn: 'আপনার পুরো নাম লিখুন' },
  passwordHint: { en: 'At least 6 letters', bn: 'কমপক্ষে ৬টি অক্ষর' },
  codeLabel: { en: 'Invite code', bn: 'আমন্ত্রণ কোড' },
  codeHint: { en: 'The code from your manager', bn: 'ম্যানেজারের দেওয়া কোড' },
  signUpButton: { en: 'Sign up', bn: 'সাইন আপ' },
  haveAccount: { en: 'Already have an account?', bn: 'আগেই অ্যাকাউন্ট আছে?' },
  goToLogin: { en: 'Log in', bn: 'লগ ইন' },
} satisfies Record<string, Words>;

/** Sentence for when the invite code is for the other role than the chosen button. */
export const codeIsFor = (role: Role): Words => {
  const word = ROLE_LABELS[role];
  return {
    en: `This code is for a ${word.en}. Please choose ${word.en} above.`,
    bn: `এই কোডটি ${word.bn}-এর জন্য। অনুগ্রহ করে উপরে ${word.bn} বেছে নিন।`,
  };
};

/**
 * Friendly sentences for the errors a sign-up can give. INVALID_CODE and
 * EMAIL_TAKEN are not in the shared ERROR_CODES list yet (Sakib's note), so this
 * is a small separate table. Anything not listed uses ERROR_TEXT.UNKNOWN.
 */
export const SIGNUP_ERROR_TEXT: Partial<Record<ApiErrorCode, Words>> = {
  INVALID_CODE: {
    en: 'That code is wrong, already used or too old. Ask your manager for a new code.',
    bn: 'এই কোডটি ভুল, আগেই ব্যবহার হয়েছে বা পুরনো। ম্যানেজারের কাছ থেকে নতুন কোড নিন।',
  },
  EMAIL_TAKEN: {
    en: 'This email already has an account. Please log in.',
    bn: 'এই ইমেইলে আগেই অ্যাকাউন্ট আছে। অনুগ্রহ করে লগ ইন করুন।',
  },
  WRONG_PLATFORM: {
    en: 'This code is for the website. The phone app is for workers and technicians.',
    bn: 'এই কোডটি ওয়েবসাইটের জন্য। ফোন অ্যাপ শ্রমিক ও টেকনিশিয়ানদের জন্য।',
  },
  INVALID_INPUT: {
    en: 'Please type your name, a real email and a password of at least 6 letters.',
    bn: 'অনুগ্রহ করে নাম, সঠিক ইমেইল ও কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড লিখুন।',
  },
};

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

  hello: { en: 'Hello', bn: 'হ্যালো' },
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

/**
 * Words on the worker's machine map (floors, rows, the colours, and the report
 * card). Status words "Waiting" and "In progress" come from `labels.ts` in
 * @garmentpulse/shared; "OK" and "Down" are only used on the map, so they live here.
 * DRAFT: the Bangla words need a Bangla speaker to read them.
 */
export const MAP_TEXT = {
  title: { en: 'Machine map', bn: 'মেশিন ম্যাপ' },
  floor: { en: 'Floor', bn: 'ফ্লোর' },
  row: { en: 'Row', bn: 'সারি' },
  machine: { en: 'Machine', bn: 'মেশিন' },
  hint: {
    en: 'Tap a machine that stopped working.',
    bn: 'যে মেশিনটি বন্ধ হয়েছে তাতে ট্যাপ করুন।',
  },
  ok: { en: 'OK', bn: 'ঠিক আছে' },
  down: { en: 'Down', bn: 'বন্ধ' },
  downCount: { en: 'down', bn: 'টি বন্ধ' },
  noneDown: { en: 'All machines OK', bn: 'সব মেশিন ঠিক আছে' },
  downOnFloor: { en: 'A machine on this floor is down', bn: 'এই ফ্লোরের একটি মেশিন বন্ধ' },
  sheetTitle: { en: 'Report this machine', bn: 'এই মেশিনটির কথা জানান' },
  whereLabel: { en: 'Where', bn: 'কোথায়' },
  descriptionLabel: { en: 'What is wrong?', bn: 'কী সমস্যা?' },
  moreLabel: { en: 'Add more words (optional)', bn: 'আরও কিছু লিখুন (ঐচ্ছিক)' },
  problemNeedle: { en: 'Needle broke', bn: 'সুই ভেঙেছে' },
  problemThread: { en: 'Thread keeps breaking', bn: 'সুতা ছিঁড়ে যাচ্ছে' },
  problemNoise: { en: 'Strange noise or smell', bn: 'অদ্ভুত শব্দ বা গন্ধ' },
  problemStart: { en: 'Machine will not start', bn: 'মেশিন চালু হচ্ছে না' },
  descriptionHint: {
    en: 'Type a few words about the problem',
    bn: 'সমস্যাটি কয়েকটি শব্দে লিখুন',
  },
  send: { en: 'Send report', bn: 'রিপোর্ট পাঠান' },
  cancel: { en: 'Cancel', bn: 'বাতিল' },
  close: { en: 'Close', bn: 'বন্ধ করুন' },
  emptyError: {
    en: 'Please pick a problem or type what is wrong.',
    bn: 'অনুগ্রহ করে একটি সমস্যা বেছে নিন বা লিখুন কী হয়েছে।',
  },
  sentNote: {
    en: 'Report sent. The machine now shows as down.',
    bn: 'রিপোর্ট পাঠানো হয়েছে। মেশিনটি এখন বন্ধ দেখাচ্ছে।',
  },
  infoDown: {
    en: 'This machine is down. A manager will send a technician.',
    bn: 'এই মেশিনটি বন্ধ। ম্যানেজার একজন টেকনিশিয়ান পাঠাবেন।',
  },
  infoWaiting: {
    en: 'A technician is assigned and will start soon.',
    bn: 'একজন টেকনিশিয়ান নির্ধারিত হয়েছেন এবং শীঘ্রই কাজ শুরু করবেন।',
  },
  infoInProgress: {
    en: 'A technician is fixing this machine now.',
    bn: 'একজন টেকনিশিয়ান এখন এই মেশিনটি ঠিক করছেন।',
  },
  demoButton: { en: 'Demo: a machine stops', bn: 'ডেমো: একটি মেশিন বন্ধ হলো' },
  demoNote: {
    en: 'Demo data. This map is not connected to the backend yet.',
    bn: 'ডেমো তথ্য। এই ম্যাপ এখনো ব্যাকএন্ডের সাথে যুক্ত নয়।',
  },
} satisfies Record<string, Words>;

/**
 * Words on the worker's live repair tracker (the step-by-step card for the worker's
 * latest report that is not finished yet).
 * DRAFT: the Bangla words need a Bangla speaker to read them.
 */
export const TRACK_TEXT = {
  title: { en: 'Your repair', bn: 'আপনার মেরামত' },
  reported: { en: 'Reported', bn: 'রিপোর্ট করা হয়েছে' },
  assigned: { en: 'Technician assigned', bn: 'টেকনিশিয়ান নির্ধারিত' },
  waitingTech: { en: 'Waiting for a technician', bn: 'টেকনিশিয়ানের অপেক্ষায়' },
  fixing: { en: 'Fixing now', bn: 'এখন ঠিক করা হচ্ছে' },
  notStarted: { en: 'Not started yet', bn: 'এখনো শুরু হয়নি' },
  done: { en: 'Done', bn: 'শেষ' },
  doneDetail: { en: 'The machine is ready', bn: 'মেশিন প্রস্তুত' },
  isWorking: { en: 'is working on it', bn: 'কাজ করছেন' },
  openHint: { en: 'Tap to see the report', bn: 'রিপোর্ট দেখতে ট্যাপ করুন' },
} satisfies Record<string, Words>;
