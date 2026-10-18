// packages/shared/src/errors.ts
//
// The list of error codes the backend can send (see Section 6 of
// docs/api-contract.md). When a backend call fails, error.message is one of
// these CAPITAL-LETTER codes. Apps turn each code into a friendly sentence in
// their own screens (Bangla and English). They never show the raw code to a person.
// Owned by Sakib.

export const ERROR_CODES = [
  'NOT_AUTHENTICATED',
  'WRONG_PLATFORM',
  'NOT_ALLOWED',
  'NOT_FOUND',
  'INVALID_INPUT',
  'TECHNICIAN_BUSY',
  'REPORT_ALREADY_ASSIGNED',
  'JOB_NOT_ACCEPTED',
  'JOB_ALREADY_ACCEPTED',
  'INVALID_STATUS_CHANGE',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

/** Used when a call fails with something that is not one of the known codes. */
export const UNKNOWN_ERROR = 'UNKNOWN' as const;

/** True when the text is one of the known error codes. */
export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && (ERROR_CODES as readonly string[]).includes(value);
}

/**
 * Reads the error code out of a failed backend call (the `error` object that
 * Supabase returns). Anything unrecognised becomes 'UNKNOWN' so the app can
 * show a general "something went wrong" sentence.
 */
export function getErrorCode(error: unknown): ErrorCode | typeof UNKNOWN_ERROR {
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? (error as { message: unknown }).message
      : undefined;
  return isErrorCode(message) ? message : UNKNOWN_ERROR;
}

// -----------------------------------------------------------------------------
// Sign-up error codes (docs/api-contract.md section 4.7)
// -----------------------------------------------------------------------------
// These two codes belong to sign-up with invite codes. They are kept in their
// OWN small list for now, on purpose: both apps keep one friendly sentence for
// every code in ERROR_CODES above, so adding them there would stop both apps
// from compiling until each app has written the two sentences. The website
// already reads them by name. When both apps have their sentences, these two
// codes move into ERROR_CODES and this list goes away.

export const SIGN_UP_ERROR_CODES = ['INVALID_CODE', 'EMAIL_TAKEN'] as const;

export type SignUpErrorCode = (typeof SIGN_UP_ERROR_CODES)[number];

/** True when the text is one of the sign-up error codes. */
export function isSignUpErrorCode(value: unknown): value is SignUpErrorCode {
  return typeof value === 'string' && (SIGN_UP_ERROR_CODES as readonly string[]).includes(value);
}

/** Every code a backend call or a sign-up can fail with. */
export type ApiErrorCode = ErrorCode | SignUpErrorCode | typeof UNKNOWN_ERROR;

/**
 * Like getErrorCode, but it also recognises the sign-up codes
 * (INVALID_CODE and EMAIL_TAKEN). Anything unrecognised becomes 'UNKNOWN'.
 */
export function getApiErrorCode(error: unknown): ApiErrorCode {
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? (error as { message: unknown }).message
      : undefined;
  if (isErrorCode(message) || isSignUpErrorCode(message)) return message;
  return UNKNOWN_ERROR;
}
