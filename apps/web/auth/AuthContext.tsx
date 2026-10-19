'use client';

// apps/web/auth/AuthContext.tsx
//
// Remembers WHO is logged in and lets any page log in or out. The person is kept
// in the browser tab's session memory, so a page refresh does not log them out,
// but closing the tab does. `ready` is false for a moment while we check that
// memory, so pages do not flash the wrong screen.
// With the real backend connected (lib/backend.ts) the login is Supabase Auth and
// Supabase remembers the session itself. Without it, the fake login and the tab's
// session memory are used. Owned by Mithi.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Profile, Role } from '@garmentpulse/shared';
import { backendIsReal } from '../lib/backend';
import { fakeLogin, fakeSignUp } from './fakeAuth';
import { realLogin, realLogOut, realRestore, realSignUp } from './realAuth';
import type { SignUpInput } from './fakeAuth';

const STORAGE_KEY = 'garmentpulse-web-user';

type AuthValue = {
  profile: Profile | null;
  ready: boolean;
  logIn: (email: string, password: string, loginFor: Role) => Promise<Profile>;
  signUp: (input: SignUpInput) => Promise<Profile>;
  logOut: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (backendIsReal) {
      // Real backend: Supabase remembers the session itself.
      void realRestore().then((person) => {
        setProfile(person);
        setReady(true);
      });
      return;
    }
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved) setProfile(JSON.parse(saved) as Profile);
    } catch {
      // Storage blocked or broken: start logged out.
    }
    setReady(true);
  }, []);

  const logIn = useCallback(async (email: string, password: string, loginFor: Role) => {
    if (backendIsReal) {
      const person = await realLogin(email, password, loginFor);
      setProfile(person);
      return person;
    }
    const person = await fakeLogin(email, password, loginFor);
    setProfile(person);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(person));
    } catch {
      // Not saving is fine: the person just stays logged in until refresh.
    }
    return person;
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    if (backendIsReal) {
      const person = await realSignUp(input);
      setProfile(person);
      return person;
    }
    const person = await fakeSignUp(input);
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
    if (backendIsReal) void realLogOut();
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clean up.
    }
  }, []);

  const value = useMemo(
    () => ({ profile, ready, logIn, signUp, logOut }),
    [profile, ready, logIn, signUp, logOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Gives a page the logged-in person (or null) and the log in / log out actions. */
export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}
