// packages/shared/src/fixtures.ts
//
// FAKE DATA for building screens before the real backend exists. It has exactly
// the shapes in docs/api-contract.md section 3, so when the apps switch to the
// real backend (round 4) nothing needs renaming.
//
// Everyone uses THIS data, so the phone app and the website show the same story:
//   - Nila reported a needle problem. Tariq is on it (in progress, so he is busy).
//   - Sumon reported a motor noise. It is assigned to Hasan but not accepted yet.
//   - Rina's thread-tension report is in the queue (nobody assigned).
//   - An old press-machine report is resolved.
//   - Mou is the only free technician.
// Owned by Sakib.

import type { Expense, ExpenseLimit, Machine, Profile, Report, Technician } from './types';
import { computeAvailability } from './helpers';

export const FAKE_MACHINES: Machine[] = [
  { id: 'm-01', name: 'Sewing machine 01', code: 'SM-01', seat: 'B1', floor: 2 },
  { id: 'm-02', name: 'Sewing machine 02', code: 'SM-02', seat: 'B2', floor: 2 },
  { id: 'm-14', name: 'Sewing machine 14', code: 'SM-14', seat: 'A4', floor: 3 },
  { id: 'c-03', name: 'Cutting machine 03', code: 'CM-03', seat: 'B1', floor: 1 },
  { id: 'p-01', name: 'Pressing machine 01', code: 'PM-01', seat: 'A2', floor: 2 },
];

export const FAKE_PEOPLE: Profile[] = [
  {
    id: 'u-worker-1',
    display_name: 'Nila Akter',
    email: 'nila@example.com',
    role: 'worker',
    // Nila works at Sewing machine 14 (the same as in the backend seed)
    machine: FAKE_MACHINES.find((m) => m.id === 'm-14') ?? null,
  },
  { id: 'u-worker-2', display_name: 'Sumon Mia', email: 'sumon@example.com', role: 'worker' },
  { id: 'u-worker-3', display_name: 'Rina Begum', email: 'rina@example.com', role: 'worker' },
  { id: 'u-tech-1', display_name: 'Tariq Hasan', email: 'tariq@example.com', role: 'technician' },
  { id: 'u-tech-2', display_name: 'Hasan Ali', email: 'hasan@example.com', role: 'technician' },
  { id: 'u-tech-3', display_name: 'Mou Khatun', email: 'mou@example.com', role: 'technician' },
  { id: 'u-manager-1', display_name: 'Farhan Kabir', email: 'farhan@example.com', role: 'manager' },
  { id: 'u-owner-1', display_name: 'Mr. Rahman', email: 'owner@example.com', role: 'owner' },
];

const person = (id: string) => {
  const p = FAKE_PEOPLE.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown fake person: ${id}`);
  return { id: p.id, display_name: p.display_name };
};
const machine = (id: string) => {
  const m = FAKE_MACHINES.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown fake machine: ${id}`);
  return { id: m.id, name: m.name, code: m.code, seat: m.seat, floor: m.floor };
};

export const FAKE_REPORTS: Report[] = [
  {
    id: 'r-100',
    machine: machine('m-14'),
    description: 'The needle keeps breaking.',
    status: 'in_progress',
    reported_by: person('u-worker-1'),
    technician: person('u-tech-1'),
    accepted_at: '2026-10-16T08:20:00Z',
    created_at: '2026-10-16T08:05:00Z',
    updated_at: '2026-10-16T08:40:00Z',
  },
  {
    id: 'r-101',
    machine: machine('c-03'),
    description: 'Strange noise from the motor.',
    status: 'waiting',
    reported_by: person('u-worker-2'),
    technician: person('u-tech-2'),
    accepted_at: null,
    created_at: '2026-10-16T09:10:00Z',
    updated_at: '2026-10-16T09:15:00Z',
  },
  {
    id: 'r-102',
    machine: machine('m-02'),
    description: 'Thread tension is too tight.',
    status: 'waiting',
    reported_by: person('u-worker-3'),
    technician: null,
    accepted_at: null,
    created_at: '2026-10-16T09:30:00Z',
    updated_at: '2026-10-16T09:30:00Z',
  },
  {
    id: 'r-099',
    machine: machine('p-01'),
    description: 'The press does not heat up.',
    status: 'resolved',
    reported_by: person('u-worker-1'),
    technician: person('u-tech-1'),
    accepted_at: '2026-10-15T10:00:00Z',
    created_at: '2026-10-15T09:45:00Z',
    updated_at: '2026-10-15T12:30:00Z',
  },
];

/** The technicians as the manager sees them, with free/busy worked out from FAKE_REPORTS. */
export const FAKE_TECHNICIANS: Technician[] = FAKE_PEOPLE.filter(
  (p) => p.role === 'technician',
).map((p) => ({
  id: p.id,
  display_name: p.display_name,
  availability: computeAvailability(FAKE_REPORTS, p.id),
}));

// -----------------------------------------------------------------------------
// Fake expenses (docs/api-contract.md section 4.8)
// -----------------------------------------------------------------------------
// The story: the owner's limit is 1,000 taka. Tariq sent four costs, one in
// each situation a screen must show:
//   e-4  over the limit, WAITING for the owner
//   e-3  under the limit, APPROVED, not recorded yet (the manager can record it)
//   e-2  over the limit, REJECTED by the owner with a reason
//   e-1  under the limit, approved and already RECORDED by the manager
// The photo paths point at no real files: show a placeholder picture for them.

export const FAKE_EXPENSE_LIMIT: ExpenseLimit = {
  amount: 1000,
  updated_at: '2026-10-14T06:00:00Z',
};

const job = (id: string): Expense['report'] => {
  const r = FAKE_REPORTS.find((x) => x.id === id);
  if (!r) throw new Error(`Unknown fake report: ${id}`);
  return { id: r.id, description: r.description, machine: r.machine };
};

/** What every fake expense shares: sent by Tariq, nothing decided or recorded. */
const sentByTariq = (id: string, at: string) => ({
  id,
  technician: person('u-tech-1'),
  invoice_path: `u-tech-1/${id}-invoice.jpg`,
  receipt_path: `u-tech-1/${id}-receipt.jpg`,
  limit_at_submit: 1000,
  decided_by: null,
  decided_at: null,
  rejection_reason: null,
  recorded_by: null,
  recorded_at: null,
  created_at: at,
  updated_at: at,
});

/** Newest first, like the real backend. */
export const FAKE_EXPENSES: Expense[] = [
  {
    ...sentByTariq('e-4', '2026-10-16T09:00:00Z'),
    report: job('r-100'),
    amount: 2500,
    reason: 'New needle bar for the sewing machine.',
    status: 'waiting',
  },
  {
    ...sentByTariq('e-3', '2026-10-16T08:45:00Z'),
    report: job('r-100'),
    amount: 450,
    reason: 'A packet of needles.',
    status: 'approved',
  },
  {
    ...sentByTariq('e-2', '2026-10-15T11:30:00Z'),
    report: job('r-099'),
    amount: 6000,
    reason: 'A new heating plate.',
    status: 'rejected',
    decided_by: person('u-owner-1'),
    decided_at: '2026-10-15T14:00:00Z',
    rejection_reason: 'Please repair the old plate first.',
    updated_at: '2026-10-15T14:00:00Z',
  },
  {
    ...sentByTariq('e-1', '2026-10-15T11:00:00Z'),
    report: job('r-099'),
    amount: 800,
    reason: 'Heating wire and tape.',
    status: 'approved',
    recorded_by: person('u-manager-1'),
    recorded_at: '2026-10-15T15:00:00Z',
    updated_at: '2026-10-15T15:00:00Z',
  },
];
