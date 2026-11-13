// apps/web/data/machineSeats.ts
//
// Turns the list of machines and the list of reports into "seats" for the Machine map
// (components/MachineMap.tsx). Think of a cinema seat plan: every machine is one seat,
// and the colour of the seat tells what is happening with that machine.
//
//   running   no open report                        (green)
//   down      a report is waiting, no technician    (red, flashes: it is in the queue)
//   assigned  a technician was assigned, not started (amber)
//   progress  the technician is working on it        (blue)
//
// The seats are grouped into FLOORS. One floor is 3 rows (A, B, C) of 5 seats (1 to 5), so
// a seat is named like "B3" on its floor, and a factory with more than 15 machines gets a
// second floor, a third floor, and so on. A floor is filled before the next one starts.
// The machine CODE (for example "SM-14") is the real `code` the backend sends with every
// machine (done by Sakib, see requests/mithi/2026-11-02-machine-code-ready.md). A machine
// without a code falls back to "SM-" plus the seat name.
// Owned by Mithi.

import type { Machine, Report } from '@garmentpulse/shared';
import { isInQueue } from '@garmentpulse/shared';

export type SeatState = 'running' | 'down' | 'assigned' | 'progress';

export type Seat = {
  machine: Machine;
  /** The floor this seat is on, counting from 1. */
  floor: number;
  /** The short name of the seat on its floor, for example "B3". */
  label: string;
  /** The longer code shown with the machine, for example "SM-B3" (or the real code later). */
  code: string;
  state: SeatState;
  /** The open (not resolved) report of this machine, if there is one. */
  report: Report | null;
};

/** How many machines sit in one row of the map. */
export const SEATS_PER_ROW = 5;
/** How many rows one floor has. */
export const ROWS_PER_FLOOR = 3;
/** How many machines one floor holds (3 rows of 5). */
export const SEATS_PER_FLOOR = SEATS_PER_ROW * ROWS_PER_FLOOR;

/** The row letter for a row number: 0 is A, 1 is B ... */
export function rowLetter(row: number): string {
  return String.fromCharCode(65 + (row % 26));
}

/** The real machine code when the backend sends one, otherwise "SM-" plus the seat name. */
export function machineCode(machine: Machine, label: string): string {
  const real = machine.code?.trim();
  return real ? real : `SM-${label}`;
}

function stateOf(report: Report | null): SeatState {
  if (!report) return 'running';
  if (isInQueue(report)) return 'down';
  if (report.status === 'in_progress') return 'progress';
  return 'assigned';
}

/** Builds one seat per machine, sorted by name, with the newest open report of each machine. */
export function buildSeats(machines: readonly Machine[], reports: readonly Report[]): Seat[] {
  const sorted = [...machines].sort((a, b) =>
    a.name.localeCompare(b.name, 'en', { numeric: true }),
  );
  return sorted.map((machine, index) => {
    const floor = Math.floor(index / SEATS_PER_FLOOR) + 1;
    const onFloor = index % SEATS_PER_FLOOR;
    const label = `${rowLetter(Math.floor(onFloor / SEATS_PER_ROW))}${(onFloor % SEATS_PER_ROW) + 1}`;
    const open = reports
      .filter((r) => r.machine.id === machine.id && r.status !== 'resolved')
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    const report = open ?? null;
    return {
      machine,
      floor,
      label,
      code: machineCode(machine, label),
      state: stateOf(report),
      report,
    };
  });
}

/** Splits the seats into floors: floor 1 first. Each floor is a list of up to 3 rows of 5 seats. */
export function groupFloors(seats: readonly Seat[]): Seat[][][] {
  const floors: Seat[][][] = [];
  for (const seat of seats) {
    const floor = (floors[seat.floor - 1] ??= []);
    const last = floor[floor.length - 1];
    if (last && last.length < SEATS_PER_ROW) last.push(seat);
    else floor.push([seat]);
  }
  return floors;
}
