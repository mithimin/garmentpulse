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

let reports: Report[] = FAKE_REPORTS.map((report) => ({ ...report }));

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
