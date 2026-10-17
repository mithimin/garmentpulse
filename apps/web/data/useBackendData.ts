'use client';

// apps/web/data/useBackendData.ts
//
// A small helper that loads some data for a page and keeps it fresh.
// It gives the page { data, error, loading, reload }:
//   - `loading` is true until the first answer arrives,
//   - `error` holds the failure (the page turns it into a friendly sentence),
//   - `reload()` asks again (used by the "Try again" button).
// With `live` on and the real backend connected, it also listens to Supabase
// Realtime (live updates) on the `reports` table and reloads whenever a report is
// added or changed, so the manager sees changes within 5 seconds (FR-01).
// Owned by Mithi.

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { supabase } from '../lib/backend';

export function useBackendData<T>(load: () => Promise<T>, live = false) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  // Always call the newest `load` without making `reload` change on every render.
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  const reload = useCallback(async () => {
    try {
      setData(await loadRef.current());
      setError(null);
    } catch (problem) {
      setError(problem);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const channelName = `web-reports-${useId()}`;
  useEffect(() => {
    if (!live || !supabase) return;
    const client = supabase;
    const channel = client
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        void reload();
      })
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }, [live, reload, channelName]);

  return { data, error, loading, reload };
}
