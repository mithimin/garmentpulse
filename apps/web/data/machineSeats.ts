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
// That is the FALLBACK. When the backend gives EVERY machine a real `floor` and `seat`
// (added by Sakib on 2026-11-14), the map uses those real places instead.
// The machine CODE (for example "SM-14") is the real `code` the backend sends with every
// machine (done by Sakib on 2026-11-02). A machine
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

/** A real seat such as "B3" (row letter + place number), or null when it is not written like that. */
function parseSeat(seat: string | null | undefined): { row: number; place: number } | null {
  const match = /^([A-Z])(\d{1,2})$/.exec(seat?.trim().toUpperCase() ?? '');
  return match ? { row: match[1].charCodeAt(0) - 65, place: Number(match[2]) } : null;
}

/**
 * True when EVERY machine has a real floor (a whole number from 1) and a real seat, and no two
 * machines share the same floor and seat. Only then the map uses the backend's own places;
 * otherwise it falls back to filling floors in name order (fake data, or an older backend).
 */
function hasRealPlaces(machines: readonly Machine[]): boolean {
  const used = new Set<string>();
  for (const m of machines) {
    const floor = m.floor;
    if (!Number.isInteger(floor) || (floor as number) < 1 || !parseSeat(m.seat)) return false;
    const key = `${floor}-${m.seat!.trim().toUpperCase()}`;
    if (used.has(key)) return false;
    used.add(key);
  }
  return machines.length > 0;
}

/** Builds one seat per machine, sorted by name, with the newest open report of each machine. */
export function buildSeats(machines: readonly Machine[], reports: readonly Report[]): Seat[] {
  const sorted = [...machines].sort((a, b) =>
    a.name.localeCompare(b.name, 'en', { numeric: true }),
  );
  const real = hasRealPlaces(sorted);
  return sorted.map((machine, index) => {
    const floor = real ? (machine.floor as number) : Math.floor(index / SEATS_PER_FLOOR) + 1;
    const onFloor = index % SEATS_PER_FLOOR;
    const label = real
      ? machine.seat!.trim().toUpperCase()
      : `${rowLetter(Math.floor(onFloor / SEATS_PER_ROW))}${(onFloor % SEATS_PER_ROW) + 1}`;
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
    // The row comes from the seat's own letter (B3 is row B) and the place from its number,
    // so real places stay where Sakib put them, whatever order the machines arrive in.
    const place = parseSeat(seat.label);
    if (!place) continue;
    const floor = (floors[seat.floor - 1] ??= []);
    (floor[place.row] ??= []).push(seat);
  }
  for (const floor of floors) {
    for (const row of floor) {
      row?.sort((a, b) => (parseSeat(a.label)?.place ?? 0) - (parseSeat(b.label)?.place ?? 0));
    }
  }
  // A floor number nobody uses (say floor 2 is empty) or a missing row becomes an empty list.
  return Array.from(floors, (floor) => Array.from(floor ?? [], (row) => row ?? []));
}
