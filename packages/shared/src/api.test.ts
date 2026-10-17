// packages/shared/src/api.test.ts
//
// Checks that every wrapper in api.ts calls the exact backend function name
// with the exact input names from docs/api-contract.md, and that a failed call
// becomes an ApiError with the right code. Run with: npm test
// Owned by Sakib.

import { describe, expect, it } from 'vitest';
import { ApiError, createApi, type RpcClient } from './api';

/** A pretend Supabase client that remembers the last call and answers as told. */
function fakeClient(reply: { data?: unknown; error?: { message?: string } | null }) {
  const calls: { name: string; args?: Record<string, unknown> }[] = [];
  const client: RpcClient = {
    rpc: (name, args) => {
      calls.push({ name, args });
      return Promise.resolve({ data: reply.data ?? null, error: reply.error ?? null });
    },
  };
  return { client, calls };
}

describe('createApi: names and inputs match the contract', () => {
  it('calls every function with the exact name and input names', async () => {
    const { client, calls } = fakeClient({ data: [] });
    const api = createApi(client);

    await api.getMyProfile();
    await api.listMachines();
    await api.createReport('m1', 'The needle keeps breaking');
    await api.listMyReports();
    await api.listReports();
    await api.listReports('resolved');
    await api.getReport('r1');
    await api.listTechnicians();
    await api.assignTechnician('r1', 't1');
    await api.listMyJobs();
    await api.listMyJobs(true);
    await api.acceptJob('r1');
    await api.updateJobStatus('r1', 'in_progress');
    await api.getOwnerSummary();

    expect(calls).toEqual([
      { name: 'get_my_profile', args: undefined },
      { name: 'list_machines', args: undefined },
      {
        name: 'create_report',
        args: { machine_id: 'm1', description: 'The needle keeps breaking' },
      },
      { name: 'list_my_reports', args: undefined },
      { name: 'list_reports', args: { status: null } },
      { name: 'list_reports', args: { status: 'resolved' } },
      { name: 'get_report', args: { report_id: 'r1' } },
      { name: 'list_technicians', args: undefined },
      { name: 'assign_technician', args: { report_id: 'r1', technician_id: 't1' } },
      { name: 'list_my_jobs', args: { include_past: false } },
      { name: 'list_my_jobs', args: { include_past: true } },
      { name: 'accept_job', args: { report_id: 'r1' } },
      { name: 'update_job_status', args: { report_id: 'r1', status: 'in_progress' } },
      { name: 'get_owner_summary', args: undefined },
    ]);
  });

  it('returns the data the backend sent', async () => {
    const { client } = fakeClient({ data: [{ id: 'm1', name: 'Sewing machine 01' }] });
    expect(await createApi(client).listMachines()).toEqual([
      { id: 'm1', name: 'Sewing machine 01' },
    ]);
  });
});

describe('createApi: errors', () => {
  it('turns a known error code into an ApiError with that code', async () => {
    const { client } = fakeClient({ error: { message: 'TECHNICIAN_BUSY' } });
    const failure = await createApi(client)
      .assignTechnician('r1', 't1')
      .catch((e: unknown) => e);

    expect(failure).toBeInstanceOf(ApiError);
    expect((failure as ApiError).code).toBe('TECHNICIAN_BUSY');
  });

  it('turns an unknown error into the code UNKNOWN', async () => {
    const { client } = fakeClient({ error: { message: 'connection reset' } });
    const failure = await createApi(client)
      .listMachines()
      .catch((e: unknown) => e);

    expect((failure as ApiError).code).toBe('UNKNOWN');
  });
});
