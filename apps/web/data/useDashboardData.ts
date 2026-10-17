'use client';

// apps/web/data/useDashboardData.ts
//
// The data the manager and owner screens need, in one place:
//   useReports()       the list of all reports, newest first
//   useTechnicians()   the technicians with free / busy
//   useOwnerSummary()  the three count boxes (Waiting, In progress, Resolved)
// When the real backend is connected (lib/backend.ts) they call the ready-made
// functions from @garmentpulse/shared (`listReports`, `listTechnicians`,
// `getOwnerSummary`). Otherwise they use the fake data from the same package.
// Reports and technicians update live. Also here: `assignTechnician`, the manager's
// "Assign" action (`assign_technician` in the contract; fake in fake mode).
// Owned by Mithi.

import { summarizeReports } from '@garmentpulse/shared';
import type { OwnerSummary, Report, Technician } from '@garmentpulse/shared';
import { api } from '../lib/backend';
import { assignFake, getFakeReports, getFakeTechnicians } from './fakeStore';
import { useBackendData } from './useBackendData';

/** Newest first, like the real backend (docs/api-contract.md 2.3). */
function newestFirst(reports: readonly Report[]): Report[] {
  return [...reports].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

async function loadReports(): Promise<Report[]> {
  return api ? api.listReports() : newestFirst(getFakeReports());
}

async function loadTechnicians(): Promise<Technician[]> {
  return api ? api.listTechnicians() : getFakeTechnicians();
}

async function loadOwnerSummary(): Promise<OwnerSummary> {
  return api ? api.getOwnerSummary() : summarizeReports(getFakeReports());
}

export const useReports = () => useBackendData(loadReports, true);
export const useTechnicians = () => useBackendData(loadTechnicians, true);
export const useOwnerSummary = () => useBackendData(loadOwnerSummary, true);

/** The manager gives a report to a free technician. Throws an error code if it fails. */
export async function assignTechnician(reportId: string, technicianId: string): Promise<Report> {
  return api ? api.assignTechnician(reportId, technicianId) : assignFake(reportId, technicianId);
}
