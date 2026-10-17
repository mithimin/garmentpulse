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
  chooseRole: { en: 'Choose who is logging in', bn: 'কে লগইন করছেন বেছে নিন' },
  settings: { en: 'Settings', bn: 'সেটিংস' },
  languageSetting: { en: 'Language', bn: 'ভাষা' },
  signupTitle: { en: 'Sign up', bn: 'সাইন আপ' },
  signupTagline: { en: 'Create your account', bn: 'আপনার অ্যাকাউন্ট খুলুন' },
  fullNameLabel: { en: 'Full name', bn: 'পুরো নাম' },
  fullNameHint: { en: 'Type your full name', bn: 'আপনার পুরো নাম লিখুন' },
  roleQuestion: { en: 'Are you a manager or an owner?', bn: 'আপনি কি ম্যানেজার নাকি মালিক?' },
  roleChoose: { en: 'Choose one', bn: 'একটি বেছে নিন' },
  managerCodeLabel: {
    en: 'Manager code (OTP) from the owner',
    bn: 'মালিকের দেওয়া ম্যানেজার কোড (ওটিপি)',
  },
  ownerCodeLabel: { en: 'Owner code', bn: 'মালিকের কোড' },
  codeHint: { en: 'Type the code', bn: 'কোডটি লিখুন' },
  signupButton: { en: 'Sign up', bn: 'সাইন আপ' },
  newHere: { en: 'New here?', bn: 'নতুন?' },
  signupLink: { en: 'Sign up', bn: 'সাইন আপ করুন' },
  managerSignupHelp: {
    en: 'To sign up as a manager you need a one-time code (OTP) from the owner. Ask the owner to create one for you.',
    bn: 'ম্যানেজার হিসেবে সাইন আপ করতে মালিকের কাছ থেকে একটি এককালীন কোড (ওটিপি) লাগবে। মালিককে একটি কোড বানাতে বলুন।',
  },
  ownerSignupHelp: {
    en: 'To sign up as the owner you need the owner code.',
    bn: 'মালিক হিসেবে সাইন আপ করতে মালিকের কোড লাগবে।',
  },
  haveAccount: { en: 'Already have an account?', bn: 'আগেই অ্যাকাউন্ট আছে?' },
  loginLink: { en: 'Login', bn: 'লগইন' },
  codesTitle: { en: 'Manager codes', bn: 'ম্যানেজার কোড' },
  codesHelp: {
    en: 'Give a code to a new manager. Each code works only once.',
    bn: 'নতুন ম্যানেজারকে একটি কোড দিন। প্রতিটি কোড মাত্র একবার কাজ করে।',
  },
  createCode: { en: 'Create a manager code', bn: 'ম্যানেজার কোড বানান' },
  noCodes: { en: 'No unused codes yet.', bn: 'এখনো কোনো অব্যবহৃত কোড নেই।' },
  signupClosedTitle: { en: 'Sign-up is not open yet', bn: 'সাইন আপ এখনো চালু হয়নি' },
  signupClosedText: {
    en: 'Accounts are created by the team for now. Please ask them to make one for you.',
    bn: 'আপাতত টিম অ্যাকাউন্ট খুলে দেয়। অনুগ্রহ করে তাদের একটি অ্যাকাউন্ট খুলে দিতে বলুন।',
  },
  menuName: { en: 'Main menu', bn: 'প্রধান মেনু' },
  menuDashboard: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
  menuReports: { en: 'Reports', bn: 'রিপোর্ট' },
  menuTechnicians: { en: 'Technicians', bn: 'টেকনিশিয়ান' },
  greetMorning: { en: 'Good morning', bn: 'শুভ সকাল' },
  greetAfternoon: { en: 'Good afternoon', bn: 'শুভ অপরাহ্ন' },
  greetEvening: { en: 'Good evening', bn: 'শুভ সন্ধ্যা' },
  queueOne: { en: '1 report needs a technician', bn: '১টি রিপোর্টে একজন টেকনিশিয়ান লাগবে' },
  queueMany: { en: '{n} reports need a technician', bn: '{n}টি রিপোর্টে টেকনিশিয়ান লাগবে' },
  queueNone: {
    en: 'No report is waiting for a technician',
    bn: 'কোনো রিপোর্ট টেকনিশিয়ানের অপেক্ষায় নেই',
  },
  labelNewReports: { en: 'New reports', bn: 'নতুন রিপোর্ট' },
  labelResolvedToday: { en: 'Resolved today', bn: 'আজ সমাধান হয়েছে' },
  labelFreeTechnicians: { en: 'Free technicians', bn: 'ফ্রি টেকনিশিয়ান' },
  tagNeedTechnician: { en: '{n} waiting for a technician', bn: '{n}টি টেকনিশিয়ানের অপেক্ষায়' },
  tagNobodyWaiting: { en: 'Nobody is waiting', bn: 'কেউ অপেক্ষায় নেই' },
  tagStartedHour: { en: '{n} started in the last hour', bn: 'গত ১ ঘণ্টায় {n}টি শুরু হয়েছে' },
  tagAverageFix: { en: 'Avg {t} to fix', bn: 'গড়ে {t} লেগেছে' },
  tagNoFixes: { en: 'No fixes yet today', bn: 'আজ এখনো কিছু ঠিক হয়নি' },
  tagBusyOf: { en: '{busy} busy of {total}', bn: '{total} জনের মধ্যে {busy} জন ব্যস্ত' },
  managerTagline: { en: 'Manager login', bn: 'ম্যানেজার লগ ইন' },
  ownerTagline: { en: 'Owner login', bn: 'মালিকের লগ ইন' },
  emailLabel: { en: 'Email', bn: 'ইমেইল' },
  emailHint: { en: 'name@example.com', bn: 'name@example.com' },
  passwordLabel: { en: 'Password', bn: 'পাসওয়ার্ড' },
  passwordHint: { en: 'Type your password', bn: 'আপনার পাসওয়ার্ড লিখুন' },
  loginButton: { en: 'Login', bn: 'লগ ইন' },
  reportsTitle: { en: 'All reports', bn: 'সব রিপোর্ট' },
  techniciansTitle: { en: 'Technicians', bn: 'টেকনিশিয়ান' },
  colMachine: { en: 'Machine', bn: 'মেশিন' },
  colProblem: { en: 'Problem', bn: 'সমস্যা' },
  colReportedBy: { en: 'Reported by', bn: 'রিপোর্টকারী' },
  colTechnician: { en: 'Technician', bn: 'টেকনিশিয়ান' },
  colStatus: { en: 'Status', bn: 'অবস্থা' },
  colReported: { en: 'Reported', bn: 'রিপোর্টের সময়' },
  inQueue: { en: 'In the queue', bn: 'সারিতে আছে' },
  hello: { en: 'Hello', bn: 'হ্যালো' },
  comingSoon: {
    en: 'Your screen is being built. It will appear here soon.',
    bn: 'আপনার স্ক্রিন তৈরি হচ্ছে। শিগগিরই এখানে দেখা যাবে।',
  },
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
