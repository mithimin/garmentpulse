'use client';

// apps/web/data/NotificationsData.tsx
//
// A shared list of the notices the manager has received during this visit (for
// example "Cutting machine 03: In progress"). The status pop-ups (components/
// StatusAlerts.tsx) add to it, and the bell in the top bar (components/TopBar.tsx)
// shows the count and the full list. The list lives only in the page's memory, so a
// page refresh clears it. Owned by Mithi.

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export type AppNotice = { id: number; text: string; at: string };

type NotificationsValue = {
  notices: AppNotice[];
  unread: number;
  add: (text: string) => void;
  markAllRead: () => void;
  clear: () => void;
};

const MAX_NOTICES = 50;

// Used on pages that have no provider (for example the owner pages): an empty list.
const EMPTY: NotificationsValue = {
  notices: [],
  unread: 0,
  add: () => {},
  markAllRead: () => {},
  clear: () => {},
};

const NotificationsContext = createContext<NotificationsValue>(EMPTY);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notices, setNotices] = useState<AppNotice[]>([]);
  const [unread, setUnread] = useState(0);
  const nextIdRef = useRef(1);

  const add = useCallback((text: string) => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    setNotices((list) =>
      [{ id, text, at: new Date().toISOString() }, ...list].slice(0, MAX_NOTICES),
    );
    setUnread((count) => count + 1);
  }, []);

  const markAllRead = useCallback(() => setUnread(0), []);

  const clear = useCallback(() => {
    setNotices([]);
    setUnread(0);
  }, []);

  const value = useMemo(
    () => ({ notices, unread, add, markAllRead, clear }),
    [notices, unread, add, markAllRead, clear],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsValue {
  return useContext(NotificationsContext);
}
