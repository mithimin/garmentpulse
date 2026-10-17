'use client';

// apps/web/auth/AuthContext.tsx
//
// Remembers WHO is logged in and lets any page log in or out. The person is kept
// in the browser tab's session memory, so a page refresh does not log them out,
// but closing the tab does. `ready` is false for a moment while we check that
// memory, so pages do not flash the wrong screen.
// This is fake-login wiring: when the real backend arrives, the real session
// from Supabase replaces the memory trick. Owned by Mithi.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Profile, Role } from '@garmentpulse/shared';
import { fakeLogin } from './fakeAuth';

const STORAGE_KEY = 'garmentpulse-web-user';

type AuthValue = {
  profile: Profile | null;
  ready: boolean;
  logIn: (email: string, password: string, loginFor: Role) => Promise<Profile>;
  logOut: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved) setProfile(JSON.parse(saved) as Profile);
    } catch {
      // Storage blocked or broken: start logged out.
    }
    setReady(true);
  }, []);

  const logIn = useCallback(async (email: string, password: string, loginFor: Role) => {
    const person = await fakeLogin(email, password, loginFor);
    setProfile(person);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(person));
    } catch {
      // Not saving is fine: the person just stays logged in until refresh.
    }
    return person;
  }, []);

  const logOut = useCallback(() => {
    setProfile(null);
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clean up.
    }
  }, []);

  const value = useMemo(() => ({ profile, ready, logIn, logOut }), [profile, ready, logIn, logOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Gives a page the logged-in person (or null) and the log in / log out actions. */
export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}
