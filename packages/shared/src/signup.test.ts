// packages/shared/src/signup.test.ts
//
// Checks for sign-up with invite codes (docs/api-contract.md section 4.7):
// the three code wrappers, the sign-up error codes, and the `signUpWithCode`
// helper in api.ts. They use a PRETEND Supabase client, so no real login
// service is needed. The real thing is proven by the real client check in
// supabase/tests. Run with: npm test
// Owned by Sakib.

import { describe, expect, it } from 'vitest';
import { ApiError, createApi, signUpWithCode, type SignUpClient } from './api';
import {
  ERROR_CODES,
  SIGN_UP_ERROR_CODES,
  getApiErrorCode,
  getErrorCode,
  isSignUpErrorCode,
} from './errors';
import type { Platform } from './types';

type Reply = { data?: unknown; error?: { message?: string } | null };

type SignUpReply = {
  data?: { user: { identities?: unknown[] | null } | null; session: unknown | null };
  error?: { message?: string } | null;
};

const PROFILE = {
  id: 'u1',
  display_name: 'Sam Rahman',
  email: 'sam@example.com',
  role: 'worker',
};

/** A pretend client. It remembers every call, in order, and answers as told. */
function fakeClient(
  replies: {
    check?: Reply;
    profile?: Reply;
    signUp?: SignUpReply;
  } = {},
) {
  const calls: { name: string; args?: unknown }[] = [];
  const client: SignUpClient = {
    rpc: (name, args) => {
      calls.push({ name, args });
      const reply =
        name === 'check_invite_code'
          ? (replies.check ?? { data: { role: 'worker' } })
          : name === 'get_my_profile'
            ? (replies.profile ?? { data: PROFILE })
            : { data: [] };
      return Promise.resolve({ data: reply.data ?? null, error: reply.error ?? null });
    },
    auth: {
      signUp: (credentials) => {
        calls.push({ name: 'auth.signUp', args: credentials });
        const reply = replies.signUp ?? {
          data: { user: { identities: [{}] }, session: { access_token: 'token' } },
        };
        return Promise.resolve({
          data: reply.data ?? { user: null, session: null },
          error: reply.error ?? null,
        });
      },
    },
  };
  return { client, calls };
}

const GOOD = {
  platform: 'mobile' as Platform,
  fullName: 'Sam Rahman',
  email: 'sam@example.com',
  password: 'secret1',
  code: 'ABCDEFGHJK',
};

async function failureOf(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError);
    return error as ApiError;
  }
  throw new Error('Expected the call to fail, but it worked.');
}

describe('the sign-up error codes', () => {
  it('are a separate list that does not repeat the main list', () => {
    for (const code of SIGN_UP_ERROR_CODES) {
      expect((ERROR_CODES as readonly string[]).includes(code)).toBe(false);
    }
    expect(isSignUpErrorCode('INVALID_CODE')).toBe(true);
    expect(isSignUpErrorCode('EMAIL_TAKEN')).toBe(true);
    expect(isSignUpErrorCode('NOT_ALLOWED')).toBe(false);
  });

  it('are recognised by getApiErrorCode but not by the old getErrorCode', () => {
    expect(getApiErrorCode({ message: 'INVALID_CODE' })).toBe('INVALID_CODE');
    expect(getApiErrorCode({ message: 'EMAIL_TAKEN' })).toBe('EMAIL_TAKEN');
    expect(getApiErrorCode({ message: 'NOT_ALLOWED' })).toBe('NOT_ALLOWED');
    expect(getApiErrorCode({ message: 'boom' })).toBe('UNKNOWN');
    expect(getApiErrorCode(null)).toBe('UNKNOWN');
    // The old function is unchanged, so the apps' sentence tables keep compiling.
    expect(getErrorCode({ message: 'INVALID_CODE' })).toBe('UNKNOWN');
  });
});

describe('the invite code wrappers', () => {
  it('call the exact function and input names from the contract', async () => {
    const { client, calls } = fakeClient();
    const api = createApi(client);

    await api.checkInviteCode('ABCDEFGHJK');
    await api.createInviteCode('technician');
    await api.listInviteCodes();

    expect(calls).toEqual([
      { name: 'check_invite_code', args: { code: 'ABCDEFGHJK' } },
      { name: 'create_invite_code', args: { role: 'technician' } },
      { name: 'list_invite_codes', args: undefined },
    ]);
  });

  it('turn a bad code into an ApiError with the code INVALID_CODE', async () => {
    const { client } = fakeClient({ check: { error: { message: 'INVALID_CODE' } } });
    const failure = await failureOf(createApi(client).checkInviteCode('nope'));
    expect(failure.code).toBe('INVALID_CODE');
  });
});

describe('signUpWithCode', () => {
  it('checks the code, signs up, then returns the profile, in that order', async () => {
    const { client, calls } = fakeClient();

    const profile = await signUpWithCode(client, {
      ...GOOD,
      fullName: '  Sam Rahman ',
      email: '  Sam@Example.com ',
      code: ' abcdefghjk ',
    });

    expect(profile).toEqual(PROFILE);
    expect(calls.map((c) => c.name)).toEqual([
      'check_invite_code',
      'auth.signUp',
      'get_my_profile',
    ]);
    // The name is trimmed, the email is small letters, the code is in capitals.
    expect(calls[0].args).toEqual({ code: 'ABCDEFGHJK' });
    expect(calls[1].args).toEqual({
      email: 'sam@example.com',
      password: 'secret1',
      options: { data: { display_name: 'Sam Rahman', invite_code: 'ABCDEFGHJK' } },
    });
  });

  it('never sends a role: the role comes from the code', async () => {
    const { client, calls } = fakeClient();
    await signUpWithCode(client, GOOD);
    expect(JSON.stringify(calls[1].args)).not.toContain('role');
  });

  it('stops with INVALID_CODE before signing up when the code is not good', async () => {
    const { client, calls } = fakeClient({ check: { error: { message: 'INVALID_CODE' } } });
    const failure = await failureOf(signUpWithCode(client, GOOD));
    expect(failure.code).toBe('INVALID_CODE');
    expect(calls.map((c) => c.name)).toEqual(['check_invite_code']);
  });

  it.each([
    ['manager', 'mobile'],
    ['worker', 'web'],
    ['technician', 'web'],
  ] as const)(
    'stops with WRONG_PLATFORM for a %s code on the %s app, before creating anything',
    async (role, platform) => {
      const { client, calls } = fakeClient({ check: { data: { role } } });
      const failure = await failureOf(signUpWithCode(client, { ...GOOD, platform }));
      expect(failure.code).toBe('WRONG_PLATFORM');
      expect(calls.map((c) => c.name)).toEqual(['check_invite_code']);
    },
  );

  it.each([
    ['a worker code', 'worker', 'mobile'],
    ['a technician code', 'technician', 'mobile'],
    ['a manager code', 'manager', 'web'],
  ] as const)('accepts %s on the right app', async (_label, role, platform) => {
    const { client } = fakeClient({ check: { data: { role } } });
    await expect(signUpWithCode(client, { ...GOOD, platform })).resolves.toEqual(PROFILE);
  });

  it('says EMAIL_TAKEN when Supabase says the user is already registered', async () => {
    const { client } = fakeClient({ signUp: { error: { message: 'User already registered' } } });
    expect((await failureOf(signUpWithCode(client, GOOD))).code).toBe('EMAIL_TAKEN');
  });

  it('says EMAIL_TAKEN when Supabase answers with an empty list of identities', async () => {
    const { client } = fakeClient({
      signUp: { data: { user: { identities: [] }, session: null } },
    });
    expect((await failureOf(signUpWithCode(client, GOOD))).code).toBe('EMAIL_TAKEN');
  });

  it('says INVALID_CODE when the database guard refuses a moment after the check', async () => {
    const { client } = fakeClient({
      signUp: { error: { message: 'Database error saving new user' } },
    });
    expect((await failureOf(signUpWithCode(client, GOOD))).code).toBe('INVALID_CODE');
  });

  it('says INVALID_INPUT when Supabase rejects the password', async () => {
    const { client } = fakeClient({
      signUp: { error: { message: 'Password should be at least 6 characters.' } },
    });
    expect((await failureOf(signUpWithCode(client, GOOD))).code).toBe('INVALID_INPUT');
  });

  it('says UNKNOWN for a problem it does not recognise', async () => {
    const { client } = fakeClient({ signUp: { error: { message: 'network exploded' } } });
    expect((await failureOf(signUpWithCode(client, GOOD))).code).toBe('UNKNOWN');
  });

  it('says UNKNOWN when no login came back (email confirmation is switched on)', async () => {
    const { client } = fakeClient({
      signUp: { data: { user: { identities: [{}] }, session: null } },
    });
    expect((await failureOf(signUpWithCode(client, GOOD))).code).toBe('UNKNOWN');
  });

  it.each([
    ['an empty name', { fullName: '   ' }],
    ['a name longer than 80 letters', { fullName: 'x'.repeat(81) }],
    ['an email without @', { email: 'sam.example.com' }],
    ['a password shorter than 6 letters', { password: '12345' }],
  ])('refuses %s with INVALID_INPUT and sends nothing', async (_label, change) => {
    const { client, calls } = fakeClient();
    const failure = await failureOf(signUpWithCode(client, { ...GOOD, ...change }));
    expect(failure.code).toBe('INVALID_INPUT');
    expect(calls).toEqual([]);
  });
});

describe('signUpWithCode with an optional Bangla name', () => {
  it('sends the Bangla name when the person wrote one', async () => {
    const { client, calls } = fakeClient();
    await signUpWithCode(client, { ...GOOD, fullNameBn: '  নতুন কর্মী ' });
    expect(calls[1].args).toEqual({
      email: 'sam@example.com',
      password: 'secret1',
      options: {
        data: {
          display_name: 'Sam Rahman',
          invite_code: 'ABCDEFGHJK',
          display_name_bn: 'নতুন কর্মী',
        },
      },
    });
  });

  it.each([
    ['missing', undefined],
    ['empty', ''],
    ['only spaces', '   '],
  ])('sends no Bangla name when it is %s', async (_label, fullNameBn) => {
    const { client, calls } = fakeClient();
    await signUpWithCode(client, { ...GOOD, fullNameBn });
    expect(JSON.stringify(calls[1].args)).not.toContain('display_name_bn');
  });

  it('refuses a Bangla name longer than 80 letters and sends nothing', async () => {
    const { client, calls } = fakeClient();
    const failure = await failureOf(
      signUpWithCode(client, { ...GOOD, fullNameBn: 'ক'.repeat(81) }),
    );
    expect(failure.code).toBe('INVALID_INPUT');
    expect(calls).toEqual([]);
  });

  it('gives back the Bangla name that the backend saved', async () => {
    const withBn = { ...PROFILE, display_name_bn: 'নতুন কর্মী' };
    const { client } = fakeClient({ profile: { data: withBn } });
    const profile = await signUpWithCode(client, { ...GOOD, fullNameBn: 'নতুন কর্মী' });
    expect(profile.display_name_bn).toBe('নতুন কর্মী');
  });
});
