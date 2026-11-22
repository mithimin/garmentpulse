// apps/mobile/src/data/useMyMachine.ts
//
// Gives the worker's Home screen the ONE machine that belongs to this worker and
// what it looks like right now (OK, down, technician assigned, being fixed).
//
// Which machine is hers?
//   TEMPORARY: the worker chooses it once from the list, and the phone remembers it
//   (AsyncStorage, one choice per person). The backend does not yet say which machine
//   is assigned to which worker (note to Sakib in
//   requests/sakib/2026-11-21-worker-assigned-machine.md). When that field exists,
//   use it instead of the saved choice.
//
// What does it look like?
//   - The colour comes from the REAL live machine states (`list_machine_states()`),
//     and a live subscription on `machine_states` refreshes it within seconds.
//   - The flow: cream (normal) -> red (reported) -> yellow (a technician is assigned
//     or working) -> cream again as soon as the report is resolved.
//   - A short beep plays when the machine turns down (not when the screen first
//     opens with a machine that was already down).
// Owned by Rubaiya.

import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Machine, MachineState, Profile } from '@garmentpulse/shared';
import { api, supabase } from '../backend/supabase';
import { useDownSound } from '../components/useDownSound';
import type { MyMachineLook } from '../components/myMachineLooks';
import { useReports } from './ReportsContext';

export function useMyMachine(profile: Profile): {
  machine: Machine | null;
  /** True when this worker still has to choose their machine (first time, or after "change"). */
  needsChoice: boolean;
  /** All machines, for the "choose your machine" list. */
  machines: Machine[];
  /** Remembers this machine as the worker's own (saved on this phone). */
  chooseMachine: (machineId: string) => void;
  /** Forgets the choice, so the worker can pick another machine. */
  changeMachine: () => void;
  look: MyMachineLook;
  /** Downloads the machine's look again (used when the person pulls the screen down). */
  refresh: () => Promise<void>;
} {
  const { machines, listMyReports } = useReports();
  // The worker picks their own machine once. It is remembered on this phone, one
  // choice per person (key includes the profile id), so a new worker never inherits
  // another worker's machine. `undefined` = still reading the phone's memory.
  const storageKey = `gp.myMachine.${profile.id}`;
  const [chosenId, setChosenId] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    setChosenId(undefined);
    AsyncStorage.getItem(storageKey)
      .then((value) => !cancelled && setChosenId(value))
      .catch(() => !cancelled && setChosenId(null));
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  const chooseMachine = useCallback(
    (id: string) => {
      setChosenId(id);
      AsyncStorage.setItem(storageKey, id).catch(() => {});
    },
    [storageKey],
  );
  const changeMachine = useCallback(() => {
    setChosenId(null);
    AsyncStorage.removeItem(storageKey).catch(() => {});
  }, [storageKey]);

  const machine = chosenId ? (machines.find((item) => item.id === chosenId) ?? null) : null;
  const machineId = machine?.id ?? null;
  const needsChoice = chosenId !== undefined && machine === null && machines.length > 0;

  const [state, setState] = useState<MachineState>('ok');
  const [loaded, setLoaded] = useState(false);
  const playDownSound = useDownSound();

  const refreshState = useCallback(async () => {
    if (!machineId) return;
    try {
      const rows = await api.listMachineStates();
      setState(rows.find((row) => row.machine_id === machineId)?.state ?? 'ok');
      setLoaded(true);
    } catch {
      // no internet: keep showing the last look
    }
  }, [machineId]);

  // Download the look at the start, every time the worker's reports change (that live
  // feed is known to work, and the database updates the machine state in the same
  // step as the report), and every 10 seconds as a safety net.
  // `listMyReports` gets a new identity whenever the reports change.
  useEffect(() => {
    void refreshState();
  }, [refreshState, listMyReports]);

  useEffect(() => {
    const timer = setInterval(() => void refreshState(), 10 * 1000);
    return () => clearInterval(timer);
  }, [refreshState]);

  // Live updates on the small `machine_states` table. As with reports, the live
  // connection must get the person's login BEFORE it subscribes.
  useEffect(() => {
    if (!machineId) return;
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled || !data.session) return;
      await supabase.realtime.setAuth(data.session.access_token);
      if (cancelled) return;
      channel = supabase
        .channel(`my-machine-${profile.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'machine_states' }, () => {
          void refreshState();
        })
        .subscribe();
    })();
    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [machineId, profile.id, refreshState]);

  // cream (normal) -> red (reported) -> yellow (technician assigned / working) -> cream
  const look: MyMachineLook =
    state === 'down'
      ? 'down'
      : state === 'waiting'
        ? 'assigned'
        : state === 'in_progress'
          ? 'fixing'
          : 'ok';

  // beep when the machine turns down (never on the very first look)
  const previous = useRef<MyMachineLook | null>(null);
  useEffect(() => {
    if (!loaded) return;
    if (previous.current !== null && previous.current !== 'down' && look === 'down') {
      playDownSound();
    }
    previous.current = look;
  }, [look, loaded, playDownSound]);

  return {
    machine,
    needsChoice,
    machines,
    chooseMachine,
    changeMachine,
    look,
    refresh: refreshState,
  };
}
