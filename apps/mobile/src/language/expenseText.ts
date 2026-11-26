// apps/mobile/src/language/expenseText.ts
//
// The words for the technician's job cost: the button on the job page, the cost
// screen that opens after "Mark as fixed", and the list of costs for the job.
// No photos are asked for (the team decided this on 2026-11-26).
// Kept in the phone app's own folder, like screenText.ts. The Bangla words are a
// FIRST DRAFT and need a Bangla speaker to read them.
// Owned by Rubaiya.

import type { Language } from '@garmentpulse/shared';

type Words = Record<Language, string>;

export const EXPENSE_TEXT: Record<string, Words> = {
  addCostButton: { en: 'Add the job cost', bn: 'এই কাজের খরচ যোগ করুন' },
  costScreenTitle: { en: 'Job cost', bn: 'কাজের খরচ' },
  costIntro: {
    en: 'Type how much this job cost and what it was for. No photo is needed.',
    bn: 'এই কাজে কত খরচ হয়েছে আর কিসের জন্য, লিখুন। ছবির দরকার নেই।',
  },
  sectionTitle: { en: 'Costs sent for this job', bn: 'এই কাজের পাঠানো খরচ' },
  amountLabel: { en: 'Amount (taka)', bn: 'টাকার পরিমাণ' },
  amountHint: { en: 'For example 450', bn: 'যেমন ৪৫০' },
  reasonLabel: { en: 'What was it for?', bn: 'কিসের জন্য খরচ?' },
  reasonHint: { en: 'For example a new needle and oil', bn: 'যেমন: নতুন সুই আর তেল' },
  sendButton: { en: 'Send cost', bn: 'খরচ পাঠান' },
  sentTitle: { en: 'Cost sent', bn: 'খরচ পাঠানো হয়েছে' },
  amountInvalid: {
    en: 'Please type an amount above 0, with at most 2 decimal places.',
    bn: 'দয়া করে ০-এর বেশি একটি টাকার পরিমাণ লিখুন (সর্বোচ্চ ২ দশমিক ঘর)।',
  },
  reasonMissing: {
    en: 'Please say what the cost was for (up to 500 letters).',
    bn: 'দয়া করে লিখুন খরচটি কিসের জন্য (সর্বোচ্চ ৫০০ অক্ষর)।',
  },
  noCostsYet: {
    en: 'No costs sent for this job yet.',
    bn: 'এই কাজের জন্য এখনও কোনো খরচ পাঠানো হয়নি।',
  },
  demoNote: {
    en: 'Demo for now: costs are kept on this phone only.',
    bn: 'এখন ডেমো: খরচ শুধু এই ফোনে থাকে।',
  },
  statusApproved: { en: 'Approved', bn: 'অনুমোদিত' },
  statusWaiting: { en: 'Waiting for owner', bn: 'মালিকের অপেক্ষায়' },
  statusRejected: { en: 'Rejected', bn: 'না-মঞ্জুর' },
};
