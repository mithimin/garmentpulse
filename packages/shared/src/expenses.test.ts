// packages/shared/src/expenses.test.ts
//
// Checks the expense part of the toolbox with a pretend backend: the function
// and input names match docs/api-contract.md section 4.8, the photo helpers
// behave, and the fake expenses obey the product rules. The real services are
// tested by supabase/tests/real_client.check.ts. Run with: npm test
// Owned by Sakib.

import { describe, expect, it } from 'vitest';
import { ApiError, createApi, type RpcClient } from './api';
import { getApiErrorCode, getErrorCode } from './errors';
import {
  getExpensePhotoUrl,
  MAX_EXPENSE_PHOTO_BYTES,
  uploadExpensePhoto,
  type PhotoClient,
} from './expenses';
import { FAKE_EXPENSE_LIMIT, FAKE_EXPENSES, FAKE_REPORTS } from './fixtures';
import { canDecideExpense, canRecordExpense, expenseStatusFor } from './helpers';
import { EXPENSE_STATUS_LABELS, LANGUAGES } from './labels';
import { EXPENSE_STATUSES } from './types';

/** A pretend storage box that remembers uploads and fails when told to. */
function fakeStorage(failWith?: string) {
  const uploads: { bucket: string; path: string; contentType?: string }[] = [];
  const error = failWith ? { message: failWith } : null;
  const client: PhotoClient = {
    storage: {
      from: (bucket) => ({
        upload: (path, _body, options) => {
          uploads.push({ bucket, path, contentType: options?.contentType });
          return Promise.resolve({ error });
        },
        createSignedUrl: (path, expiresIn) =>
          Promise.resolve({
            data: error ? null : { signedUrl: `https://photos.test/${path}?s=${expiresIn}` },
            error,
          }),
      }),
    },
  };
  return { client, uploads };
}

/** The code of a call that must fail. */
async function codeOf(call: Promise<unknown>): Promise<string> {
  try {
    await call;
  } catch (error) {
    if (error instanceof ApiError) return error.code;
    throw error;
  }
  return 'NO_ERROR';
}

const photo = (over: Partial<Parameters<typeof uploadExpensePhoto>[1]> = {}) => ({
  technicianId: 'u-tech-1',
  data: new Uint8Array([1, 2, 3]),
  contentType: 'image/jpeg' as const,
  ...over,
});

describe('expense calls match the contract', () => {
  it('uses the exact function and input names', async () => {
    const calls: unknown[] = [];
    const client: RpcClient = {
      rpc: (name, args) => {
        calls.push({ name, args });
        return Promise.resolve({ data: null, error: null });
      },
    };
    const api = createApi(client);

    await api.submitExpense({
      reportId: 'r1',
      amount: 450.5,
      reason: 'Needles',
      invoicePath: 't/i.jpg',
      receiptPath: 't/r.jpg',
    });
    await api.listMyExpenses();
    await api.listExpenses();
    await api.listExpenses('waiting');
    await api.getExpense('e1');
    await api.decideExpense('e1', 'approved');
    await api.decideExpense('e1', 'rejected', 'Too expensive');
    await api.recordExpense('e1');
    await api.getExpenseLimit();
    await api.setExpenseLimit(1000);

    expect(calls).toEqual([
      {
        name: 'submit_expense',
        args: {
          report_id: 'r1',
          amount: 450.5,
          reason: 'Needles',
          invoice_path: 't/i.jpg',
          receipt_path: 't/r.jpg',
        },
      },
      { name: 'list_my_expenses', args: undefined },
      { name: 'list_expenses', args: { status: null } },
      { name: 'list_expenses', args: { status: 'waiting' } },
      { name: 'get_expense', args: { expense_id: 'e1' } },
      { name: 'decide_expense', args: { expense_id: 'e1', decision: 'approved', reason: null } },
      {
        name: 'decide_expense',
        args: { expense_id: 'e1', decision: 'rejected', reason: 'Too expensive' },
      },
      { name: 'record_expense', args: { expense_id: 'e1' } },
      { name: 'get_expense_limit', args: undefined },
      { name: 'set_expense_limit', args: { amount: 1000 } },
    ]);
  });

  it('keeps the expense error codes apart from the older list', () => {
    const failure = { message: 'EXPENSE_NOT_APPROVED' };
    expect(getApiErrorCode(failure)).toBe('EXPENSE_NOT_APPROVED');
    expect(getErrorCode(failure)).toBe('UNKNOWN');
  });
});

describe('photo helpers', () => {
  it('uploads into the technician folder with a name the database accepts', async () => {
    const { client, uploads } = fakeStorage();
    const first = await uploadExpensePhoto(client, photo());
    const second = await uploadExpensePhoto(client, photo({ contentType: 'image/png' }));

    expect(first).toMatch(/^u-tech-1\/[A-Za-z0-9_-]{1,100}\.jpg$/);
    expect(second).toMatch(/^u-tech-1\/[A-Za-z0-9_-]{1,100}\.png$/);
    expect(first).not.toBe(second);
    expect(uploads[0]).toEqual({
      bucket: 'expense-photos',
      path: first,
      contentType: 'image/jpeg',
    });
  });

  it('refuses an empty or too big photo before sending anything', async () => {
    const { client, uploads } = fakeStorage();
    const empty = photo({ data: new Uint8Array(0) });
    const huge = photo({ data: new ArrayBuffer(MAX_EXPENSE_PHOTO_BYTES + 1) });
    expect(await codeOf(uploadExpensePhoto(client, empty))).toBe('INVALID_INPUT');
    expect(await codeOf(uploadExpensePhoto(client, huge))).toBe('INVALID_INPUT');
    expect(uploads).toEqual([]);
  });

  it('turns storage failures into our codes', async () => {
    const cases = [
      ['new row violates row-level security policy', 'NOT_ALLOWED'],
      ['mime type text/plain is not supported', 'INVALID_INPUT'],
      ['The object exceeded the maximum allowed size', 'INVALID_INPUT'],
      ['Failed to fetch', 'UNKNOWN'],
    ];
    for (const [message, code] of cases) {
      expect(await codeOf(uploadExpensePhoto(fakeStorage(message).client, photo()))).toBe(code);
    }
  });

  it('gives a link to a photo, or NOT_FOUND', async () => {
    expect(await getExpensePhotoUrl(fakeStorage().client, 't/r.jpg')).toBe(
      'https://photos.test/t/r.jpg?s=300',
    );
    expect(await codeOf(getExpensePhotoUrl(fakeStorage('nope').client, 't/r.jpg'))).toBe(
      'NOT_FOUND',
    );
  });
});

describe('expense rules and fake data', () => {
  it('approves at or under the limit and waits otherwise', () => {
    expect(expenseStatusFor(999, 1000)).toBe('approved');
    expect(expenseStatusFor(1000, 1000)).toBe('approved');
    expect(expenseStatusFor(1000.01, 1000)).toBe('waiting');
    expect(expenseStatusFor(1, null)).toBe('waiting');
    expect(expenseStatusFor(1, 0)).toBe('waiting');
  });

  it('has a word for every status in both languages', () => {
    for (const status of EXPENSE_STATUSES) {
      for (const lang of LANGUAGES) expect(EXPENSE_STATUS_LABELS[status][lang]).not.toBe('');
    }
  });

  it('offers the right buttons on the fake costs', () => {
    expect(FAKE_EXPENSES.filter(canDecideExpense).map((e) => e.id)).toEqual(['e-4']);
    expect(FAKE_EXPENSES.filter(canRecordExpense).map((e) => e.id)).toEqual(['e-3']);
  });

  it('obeys the rules of the real database', () => {
    const paths = FAKE_EXPENSES.flatMap((e) => [e.invoice_path, e.receipt_path]);
    expect(new Set(paths).size).toBe(paths.length);
    for (const e of FAKE_EXPENSES) {
      const report = FAKE_REPORTS.find((r) => r.id === e.report.id)!;
      expect(report.technician?.id).toBe(e.technician.id);
      expect(report.status).not.toBe('waiting');
      expect(e.status === 'rejected').toBe(e.rejection_reason !== null);
      if (e.recorded_at !== null) expect(e.status).toBe('approved');
      // A status the limit alone would give, unless the owner decided it.
      if (e.decided_at === null) {
        expect(e.status).toBe(expenseStatusFor(e.amount, FAKE_EXPENSE_LIMIT.amount));
      }
    }
  });
});
