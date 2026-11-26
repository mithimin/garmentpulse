// packages/shared/src/expenses.ts
//
// Helpers for the two photos of a repair cost (the invoice and the receipt),
// and the limits both apps need for their forms. The rules come from
// docs/api-contract.md section 4.8; the server enforces every one of them.
//
// How a technician sends a cost (phone app):
//
//     const invoicePath = await uploadExpensePhoto(supabase, {
//       technicianId: profile.id, data: invoiceBytes, contentType: 'image/jpeg',
//     });
//     const receiptPath = await uploadExpensePhoto(supabase, { ... });
//     await createApi(supabase).submitExpense({
//       reportId, amount: 450, reason: 'A packet of needles.', invoicePath, receiptPath,
//     });
//
// How anyone allowed opens a photo (phone or website):
//
//     const url = await getExpensePhotoUrl(supabase, expense.receipt_path);
//
// On the phone, pass the picture as an ArrayBuffer (raw bytes). Supabase advises
// against Blob or File uploads in React Native.
//
// Owned by Sakib.

import { ApiError } from './api';
import { UNKNOWN_ERROR, type ApiErrorCode } from './errors';

/** The private storage box that holds the photos. */
export const EXPENSE_PHOTO_BUCKET = 'expense-photos';

/** The biggest photo the storage box accepts: 5 MB. */
export const MAX_EXPENSE_PHOTO_BYTES = 5 * 1024 * 1024;

export const EXPENSE_PHOTO_TYPES = ['image/jpeg', 'image/png'] as const;
export type ExpensePhotoType = (typeof EXPENSE_PHOTO_TYPES)[number];

/** The largest amount of one cost, and of the owner's limit, in taka. */
export const MAX_EXPENSE_AMOUNT = 10_000_000;
/** The longest "what was the money for" text. */
export const MAX_EXPENSE_REASON_LENGTH = 500;
/** The longest "why not" text the owner writes. */
export const MAX_REJECTION_REASON_LENGTH = 300;

/** How long a link to a photo works, unless the app asks for another time. */
export const PHOTO_LINK_SECONDS = 300;

/** The picture itself: raw bytes (use this on the phone) or a browser file. */
export type PhotoData = ArrayBuffer | Uint8Array | Blob;

/**
 * The smallest part of the Supabase client these helpers need. The real
 * Supabase client has it.
 */
export type PhotoClient = {
  storage: {
    from(bucket: string): {
      upload(
        path: string,
        body: PhotoData,
        options?: { contentType?: string },
      ): PromiseLike<{ error: { message?: string } | null }>;
      createSignedUrl(
        path: string,
        expiresIn: number,
      ): PromiseLike<{
        data: { signedUrl: string } | null;
        error: { message?: string } | null;
      }>;
    };
  };
};

export type PhotoUpload = {
  /** The logged-in technician's own profile id: it is the folder name. */
  technicianId: string;
  data: PhotoData;
  contentType: ExpensePhotoType;
};

/**
 * A new file name that no earlier photo has. It only has to be unique, not
 * secret (the box is private), so it needs no special random library, which
 * the phone does not have.
 */
function newPhotoName(contentType: ExpensePhotoType): string {
  const random = () => Math.random().toString(36).slice(2, 10);
  const ending = contentType === 'image/png' ? 'png' : 'jpg';
  return `${Date.now().toString(36)}-${random()}${random()}.${ending}`;
}

function sizeOf(data: PhotoData): number {
  return 'byteLength' in data ? data.byteLength : data.size;
}

/** Turns the message of a failed upload into one of our codes. */
function uploadErrorCode(message: string | undefined): ApiErrorCode {
  const text = (message ?? '').toLowerCase();
  if (text.includes('row-level security') || text.includes('unauthorized')) return 'NOT_ALLOWED';
  if (text.includes('mime type') || text.includes('exceeded') || text.includes('too large')) {
    return 'INVALID_INPUT';
  }
  return UNKNOWN_ERROR;
}

/**
 * Uploads one photo into the technician's folder and returns its path, ready
 * for `submitExpense`. Each photo can be used for only one cost, so upload a
 * new one every time.
 *
 * Fails with an `ApiError`: INVALID_INPUT (empty, over 5 MB, or not a JPG or
 * PNG), NOT_ALLOWED (not this technician's folder), or UNKNOWN (for example no
 * internet).
 */
export async function uploadExpensePhoto(client: PhotoClient, photo: PhotoUpload): Promise<string> {
  const size = sizeOf(photo.data);
  if (
    !EXPENSE_PHOTO_TYPES.includes(photo.contentType) ||
    size === 0 ||
    size > MAX_EXPENSE_PHOTO_BYTES
  ) {
    throw new ApiError('INVALID_INPUT');
  }

  const path = `${photo.technicianId}/${newPhotoName(photo.contentType)}`;
  const { error } = await client.storage
    .from(EXPENSE_PHOTO_BUCKET)
    .upload(path, photo.data, { contentType: photo.contentType });
  if (error) {
    throw new ApiError(uploadErrorCode(error.message));
  }
  return path;
}

/**
 * A short-lived link that shows one photo. Ask for a new link each time the
 * photo is shown; never save it.
 *
 * Fails with an `ApiError` NOT_FOUND when there is no such photo or this person
 * may not open it (the storage service does not say which).
 */
export async function getExpensePhotoUrl(
  client: PhotoClient,
  path: string,
  seconds: number = PHOTO_LINK_SECONDS,
): Promise<string> {
  const { data, error } = await client.storage
    .from(EXPENSE_PHOTO_BUCKET)
    .createSignedUrl(path, seconds);
  if (error || !data) {
    throw new ApiError('NOT_FOUND');
  }
  return data.signedUrl;
}
