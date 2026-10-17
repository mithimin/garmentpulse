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
// Reports and technicians update live. Owned by Mithi.

import { FAKE_REPORTS, FAKE_TECHNICIANS, summarizeReports } from '@garmentpulse/shared';
import type { OwnerSummary, Report, Technician } from '@garmentpulse/shared';
import { api } from '../lib/backend';
import { useBackendData } from './useBackendData';

/** Newest first, like the real backend (docs/api-contract.md 2.3). */
function newestFirst(reports: readonly Report[]): Report[] {
  return [...reports].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

async function loadReports(): Promise<Report[]> {
  return api ? api.listReports() : newestFirst(FAKE_REPORTS);
}

async function loadTechnicians(): Promise<Technician[]> {
  return api ? api.listTechnicians() : [...FAKE_TECHNICIANS];
}

async function loadOwnerSummary(): Promise<OwnerSummary> {
  return api ? api.getOwnerSummary() : summarizeReports(FAKE_REPORTS);
}

export const useReports = () => useBackendData(loadReports, true);
export const useTechnicians = () => useBackendData(loadTechnicians, true);
export const useOwnerSummary = () => useBackendData(loadOwnerSummary, true);
