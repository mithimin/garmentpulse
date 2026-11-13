// apps/web/data/fakeMachines.ts
//
// FAKE machines for the Machine map when the real backend is not connected (lib/backend.ts).
// There are 45 of them, so the map shows THREE floors, each with 3 rows of 5 machines
// (see data/machineSeats.ts). The first 5 are the machines of `@garmentpulse/shared`
// (so the shared fake reports still point at real machines); the other 40 are made here.
// The real backend has no floors: with real data the machines are simply put on floors of 15
// in the same order. Owned by Mithi.

import { FAKE_MACHINES } from '@garmentpulse/shared';
import type { Machine } from '@garmentpulse/shared';

/** The kinds of machine, with how many of each there are (45 in all). */
const KINDS: { name: string; code: string; count: number }[] = [
  { name: 'Buttonhole machine', code: 'BH', count: 3 },
  { name: 'Cutting machine', code: 'CM', count: 5 },
  { name: 'Overlock machine', code: 'OL', count: 8 },
  { name: 'Pressing machine', code: 'PM', count: 4 },
  { name: 'Sewing machine', code: 'SM', count: 25 },
];

function two(n: number): string {
  return String(n).padStart(2, '0');
}

function build(): Machine[] {
  const machines: Machine[] = FAKE_MACHINES.map((m) => ({ ...m }));
  for (const kind of KINDS) {
    for (let n = 1; n <= kind.count; n++) {
      const code = `${kind.code}-${two(n)}`;
      if (machines.some((m) => m.code === code)) continue; // one of the first 5
      machines.push({
        id: `${kind.code.toLowerCase()}-${two(n)}`,
        name: `${kind.name} ${two(n)}`,
        code,
      });
    }
  }
  return machines;
}

/** All 45 fake machines. */
export const FAKE_FLOOR_MACHINES: Machine[] = build();
