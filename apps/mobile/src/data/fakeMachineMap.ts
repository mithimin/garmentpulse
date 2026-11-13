// apps/mobile/src/data/fakeMachineMap.ts
//
// FAKE data for the worker's machine map (it is NOT connected to the backend yet).
// The real backend has no "floor" or "row" for machines, and a worker cannot read
// other people's reports, so the team asked Sakib for both (see
// requests/sakib/2026-11-14-worker-machine-map.md). Until that is built, the map
// uses this made-up factory:
//   - Floor 1 has rows A to D, floor 2 has rows A to C, floor 3 has rows A to C;
//   - every row has 6 machines, named like "F2-C4" (floor 2, row C, place 4);
//   - a few machines start in other states, so every colour can be seen.
// When a worker reports a machine, it turns "down". To let the colours be tried
// without a technician, the fake store then moves it on by itself: waiting after
// 10 seconds, in progress after 20, and back to OK after 35.
// Keep all of this fake wiring inside the phone app (see apps/mobile/CLAUDE.md).
// Owned by Rubaiya.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** The four looks of a machine on the map. */
export type MapStatus = 'ok' | 'down' | 'waiting' | 'in_progress';

export type MapMachine = {
  id: string;
  /** Short name shown on the map, like "F2-C4". */
  code: string;
  floor: number;
  /** The row letter, like "C". */
  row: string;
  /** The place number in the row, 1 to 6. */
  place: number;
  status: MapStatus;
  /** What the worker typed when they reported it (fake store only). */
  description?: string;
};

/** How many rows each floor has. */
const ROWS_PER_FLOOR: Record<number, number> = { 1: 4, 2: 3, 3: 3 };
const MACHINES_PER_ROW = 6;

/** A few machines start in other states, so every colour can be seen at the start. */
const STARTING_STATES: Record<string, MapStatus> = {
  'F1-B3': 'in_progress',
  'F1-C5': 'waiting',
  'F2-A4': 'down',
  'F3-B2': 'in_progress',
};

function buildMachines(): MapMachine[] {
  const machines: MapMachine[] = [];
  for (const floor of [1, 2, 3]) {
    for (let rowIndex = 0; rowIndex < ROWS_PER_FLOOR[floor]; rowIndex++) {
      const row = String.fromCharCode(65 + rowIndex);
      for (let place = 1; place <= MACHINES_PER_ROW; place++) {
        const code = `F${floor}-${row}${place}`;
        machines.push({
          id: code,
          code,
          floor,
          row,
          place,
          status: STARTING_STATES[code] ?? 'ok',
        });
      }
    }
  }
  return machines;
}

/** The floor numbers of the fake factory. */
export const FAKE_FLOORS: readonly number[] = [1, 2, 3];

export type MachineMapStore = {
  machines: MapMachine[];
  /** All machines of one floor, grouped by row letter (A, B, C ...). */
  rowsOfFloor: (floor: number) => { row: string; machines: MapMachine[] }[];
  /** A worker reports a machine: it turns "down" at once. */
  reportDown: (machineId: string, description: string) => void;
  /** Demo only: pretend a machine somewhere in the factory just stopped. */
  pretendMachineStops: () => void;
};

/** The fake store: the machines, and what happens when one is reported. */
export function useFakeMachineMap(): MachineMapStore {
  const [machines, setMachines] = useState<MapMachine[]>(buildMachines);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // stop any waiting timers when the screen goes away
  useEffect(() => {
    const running = timers.current;
    return () => running.forEach(clearTimeout);
  }, []);

  const setStatus = useCallback((machineId: string, status: MapStatus, description?: string) => {
    setMachines((current) =>
      current.map((machine) =>
        machine.id === machineId
          ? { ...machine, status, description: description ?? machine.description }
          : machine,
      ),
    );
  }, []);

  /** Moves a down machine on by itself, only so the colours can be seen. */
  const simulateTechnician = useCallback(
    (machineId: string) => {
      timers.current.push(
        setTimeout(() => setStatus(machineId, 'waiting'), 10_000),
        setTimeout(() => setStatus(machineId, 'in_progress'), 20_000),
        setTimeout(() => setStatus(machineId, 'ok'), 35_000),
      );
    },
    [setStatus],
  );

  const reportDown = useCallback(
    (machineId: string, description: string) => {
      setStatus(machineId, 'down', description);
      simulateTechnician(machineId);
    },
    [setStatus, simulateTechnician],
  );

  const pretendMachineStops = useCallback(() => {
    const okMachines = machines.filter((machine) => machine.status === 'ok');
    if (okMachines.length === 0) return;
    const pick = okMachines[Math.floor(Math.random() * okMachines.length)];
    reportDown(pick.id, '');
  }, [machines, reportDown]);

  const rowsOfFloor = useCallback(
    (floor: number) => {
      const onFloor = machines.filter((machine) => machine.floor === floor);
      const letters = Array.from(new Set(onFloor.map((machine) => machine.row))).sort();
      return letters.map((row) => ({
        row,
        machines: onFloor.filter((machine) => machine.row === row),
      }));
    },
    [machines],
  );

  return useMemo(
    () => ({ machines, rowsOfFloor, reportDown, pretendMachineStops }),
    [machines, rowsOfFloor, reportDown, pretendMachineStops],
  );
}
