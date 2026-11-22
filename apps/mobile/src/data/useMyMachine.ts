// apps/mobile/src/data/useMyMachine.ts
//
// Gives the worker's Home screen the ONE machine that belongs to this worker and
// what it looks like right now (OK, down, technician assigned, being fixed).
//
// Which machine is hers?
//   TEMPORARY STAND-IN: the first sewing machine in the list. The backend does not yet say
//   which machine is assigned to which worker (note to Sakib in
//   requests/sakib/2026-11-21-worker-assigned-machine.md). When that field exists,
//   change ONLY the line marked "STAND-IN" below.
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
import type { Machine, MachineState, Profile } from '@garmentpulse/shared';
import { api, supabase } from '../backend/supabase';
import { useDownSound } from '../components/useDownSound';
import type { MyMachineLook } from '../components/myMachineLooks';
import { useReports } from './ReportsContext';

export function useMyMachine(profile: Profile): {
  machine: Machine | null;
  look: MyMachineLook;
  /** Downloads the machine's look again (used when the person pulls the screen down). */
  refresh: () => Promise<void>;
} {
  const { machines, listMyReports } = useReports();
  // STAND-IN: the first sewing machine (code "SM-..."), or else the first machine in
  // the list, until the backend says which one is hers.
  const machine = machines.find((item) => item.code?.startsWith('SM-')) ?? machines[0] ?? null;
  const machineId = machine?.id ?? null;

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

  return { machine, look, refresh: refreshState };
}
