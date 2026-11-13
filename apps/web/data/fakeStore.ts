// apps/web/data/fakeStore.ts
//
// FAKE data that can CHANGE, used when the real backend is not connected
// (lib/backend.ts). It starts as a copy of FAKE_REPORTS from @garmentpulse/shared.
// When the manager assigns a technician, the copy is updated in memory, so the
// lists and counts really move while testing. A page refresh puts it back.
// It copies the rules and error codes of `assign_technician` in
// docs/api-contract.md 4.4. Owned by Mithi.

import { computeAvailability, FAKE_PEOPLE, FAKE_REPORTS } from '@garmentpulse/shared';
import type { Report, Technician } from '@garmentpulse/shared';
import { FAKE_FLOOR_MACHINES } from './fakeMachines';

/**
 * A few more machines that are waiting for a technician, spread over the three floors of the
 * fake Machine map, so every floor has something to show. (They have no technician, so the
 * free / busy list of the technicians does not change.)
 */
function extraQueuedReports(): Report[] {
  const worker = FAKE_PEOPLE.find((p) => p.role === 'worker');
  const problems: [string, string][] = [
    ['ol-06', 'The overlock thread keeps tangling.'],
    ['bh-02', 'The buttonhole is cut too wide.'],
    ['sm-05', 'The needle bar is stuck.'],
    ['sm-22', 'The motor smells hot.'],
    ['sm-18', 'The pedal does not respond.'],
  ];
  if (!worker) return [];
  return problems.flatMap(([id, description], index) => {
    const machine = FAKE_FLOOR_MACHINES.find((m) => m.id === id);
    if (!machine) return [];
    const when = new Date(Date.UTC(2026, 9, 17, 8 + index, 10)).toISOString();
    return [
      {
        id: `r-extra-${index + 1}`,
        machine: { id: machine.id, name: machine.name, code: machine.code },
        description,
        status: 'waiting' as const,
        reported_by: { id: worker.id, display_name: worker.display_name },
        technician: null,
        accepted_at: null,
        created_at: when,
        updated_at: when,
      },
    ];
  });
}

let reports: Report[] = [...FAKE_REPORTS, ...extraQueuedReports()].map((report) => ({
  ...report,
}));

export function getFakeReports(): Report[] {
  return reports.map((report) => ({ ...report }));
}

export function getFakeTechnicians(): Technician[] {
  return FAKE_PEOPLE.filter((p) => p.role === 'technician').map((p) => ({
    id: p.id,
    display_name: p.display_name,
    availability: computeAvailability(reports, p.id),
  }));
}

/** Gives the report to a free technician, or throws an error code from the contract. */
export async function assignFake(reportId: string, technicianId: string): Promise<Report> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const report = reports.find((r) => r.id === reportId);
  const technician = FAKE_PEOPLE.find((p) => p.id === technicianId && p.role === 'technician');
  if (!report || !technician) throw new Error('NOT_FOUND');
  if (report.status === 'resolved') throw new Error('INVALID_STATUS_CHANGE');
  if (report.technician) throw new Error('REPORT_ALREADY_ASSIGNED');
  if (computeAvailability(reports, technicianId) === 'busy') throw new Error('TECHNICIAN_BUSY');

  const updated: Report = {
    ...report,
    technician: { id: technician.id, display_name: technician.display_name },
    updated_at: new Date().toISOString(),
  };
  reports = reports.map((r) => (r.id === reportId ? updated : r));
  return updated;
}

/**
 * FAKE MODE ONLY: pretends a worker just reported a broken machine, so the Machine map
 * can be shown beeping without a phone. It picks a machine that has no open report.
 * Returns false when every machine already has one. (The real backend has no such
 * function: only a worker's phone can make a report.)
 */
export function addFakeReport(): boolean {
  const worker = FAKE_PEOPLE.find((p) => p.role === 'worker');
  const free = FAKE_FLOOR_MACHINES.filter(
    (m) => !reports.some((r) => r.machine.id === m.id && r.status !== 'resolved'),
  );
  const machine = free[Math.floor(Math.random() * free.length)];
  if (!worker || !machine) return false;

  const problems = [
    'The needle keeps breaking.',
    'Thread snaps every few stitches.',
    'Machine makes a loud grinding noise.',
    'Fabric is not feeding forward.',
  ];
  const now = new Date().toISOString();
  reports = [
    ...reports,
    {
      id: `r-demo-${Date.now()}`,
      machine: { id: machine.id, name: machine.name },
      description: problems[Math.floor(Math.random() * problems.length)] ?? problems[0] ?? '',
      status: 'waiting',
      reported_by: { id: worker.id, display_name: worker.display_name },
      technician: null,
      accepted_at: null,
      created_at: now,
      updated_at: now,
    },
  ];
  return true;
}
