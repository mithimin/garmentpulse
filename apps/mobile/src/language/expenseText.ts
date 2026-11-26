// apps/mobile/src/language/expenseText.ts
//
// The words for the technician's "costs for this job" card (invoice and receipt,
// docs/api-contract.md section 4.8). Kept in the phone app's own folder, like
// screenText.ts. The Bangla words are a FIRST DRAFT and need a Bangla speaker to read them.
// Owned by Rubaiya.

import type { Language } from '@garmentpulse/shared';

type Words = Record<Language, string>;

export const EXPENSE_TEXT: Record<string, Words> = {
  sectionTitle: { en: 'Costs for this job', bn: 'এই কাজের খরচ' },
  addButton: { en: 'Add a cost', bn: 'খরচ যোগ করুন' },
  cancelButton: { en: 'Cancel', bn: 'বাতিল' },
  amountLabel: { en: 'Amount (taka)', bn: 'টাকার পরিমাণ' },
  amountHint: { en: 'For example 450', bn: 'যেমন ৪৫০' },
  reasonLabel: { en: 'What was it for?', bn: 'কিসের জন্য খরচ?' },
  reasonHint: { en: 'For example a new needle and oil', bn: 'যেমন: নতুন সুই আর তেল' },
  invoiceLabel: { en: 'Invoice photo', bn: 'ইনভয়েসের ছবি' },
  receiptLabel: { en: 'Receipt photo', bn: 'রসিদের ছবি' },
  addPhoto: { en: 'Add photo', bn: 'ছবি যোগ করুন' },
  photoAdded: { en: 'Photo added', bn: 'ছবি যোগ হয়েছে' },
  demoPhotoNote: {
    en: 'Demo for now: the photo is not really uploaded yet.',
    bn: 'এখন ডেমো: ছবি এখনও আসলে আপলোড হচ্ছে না।',
  },
  sendButton: { en: 'Send cost', bn: 'খরচ পাঠান' },
  sendingButton: { en: 'Sending…', bn: 'পাঠানো হচ্ছে…' },
  amountInvalid: {
    en: 'Please type an amount above 0, with at most 2 decimal places.',
    bn: 'দয়া করে ০-এর বেশি একটি টাকার পরিমাণ লিখুন (সর্বোচ্চ ২ দশমিক ঘর)।',
  },
  reasonMissing: {
    en: 'Please say what the cost was for (up to 500 letters).',
    bn: 'দয়া করে লিখুন খরচটি কিসের জন্য (সর্বোচ্চ ৫০০ অক্ষর)।',
  },
  photosMissing: {
    en: 'Every cost needs an invoice photo and a receipt photo. No receipt, no expense.',
    bn: 'প্রতিটি খরচের জন্য ইনভয়েস আর রসিদ দুটো ছবিই লাগবে। রসিদ ছাড়া খরচ নয়।',
  },
  notStartedNote: {
    en: 'You can add a cost once you have accepted the job and started work.',
    bn: 'কাজ গ্রহণ করে শুরু করলে তবেই খরচ যোগ করা যাবে।',
  },
  noCostsYet: {
    en: 'No costs sent for this job yet.',
    bn: 'এই কাজের জন্য এখনও কোনো খরচ পাঠানো হয়নি।',
  },
  statusApproved: { en: 'Approved', bn: 'অনুমোদিত' },
  statusWaiting: { en: 'Waiting for owner', bn: 'মালিকের অপেক্ষায়' },
  statusRejected: { en: 'Rejected', bn: 'না-মঞ্জুর' },
  rejectedBecause: { en: 'Reason', bn: 'কারণ' },
};
