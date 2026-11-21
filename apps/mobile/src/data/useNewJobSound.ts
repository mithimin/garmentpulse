// apps/mobile/src/data/useNewJobSound.ts
//
// Plays a short beep on the technician's phone when a NEW job is assigned to them,
// so they notice it even if they are not looking at the screen. It only works while
// the app is open (push notifications, which also work when the app is closed, are
// not in the MVP). It uses the same two-tone beep as the machine that goes down.
// It stays quiet for the jobs that are already there when the app opens, and when a
// job simply changes its status.
// Owned by Rubaiya.

import { useEffect, useRef } from 'react';
import type { Profile } from '@garmentpulse/shared';
import { useDownSound } from '../components/useDownSound';
import { useReports } from './ReportsContext';

export function useNewJobSound(profile: Profile) {
  const { loading, listMyJobs } = useReports();
  const playSound = useDownSound();
  // the ids of the open jobs we have already seen (null = nothing downloaded yet)
  const seen = useRef<Set<string> | null>(null);

  const openJobIds = listMyJobs(profile, false)
    .map((job) => job.id)
    .join(',');

  useEffect(() => {
    if (loading) return;
    const ids = openJobIds === '' ? [] : openJobIds.split(',');
    if (seen.current !== null && ids.some((id) => !seen.current?.has(id))) {
      playSound();
    }
    seen.current = new Set(ids);
  }, [openJobIds, loading, playSound]);
}
