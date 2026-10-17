// apps/mobile/App.tsx
//
// The main component of GarmentPulse Mobile (workers and technicians).
// It decides which screen to show:
//   - nobody logged in     -> the login screen
//   - a worker logged in   -> the worker screens (Home, Report, My reports)
//   - a technician         -> a temporary home screen (the real technician
//                             screens come in the next step)
// It also wraps everything in two "holders": one remembers the chosen language
// (English or Bangla), the other holds the fake reports until the real backend exists.
// Owned by Rubaiya.

import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import type { Profile } from '@garmentpulse/shared';
import { ReportsProvider } from './src/data/ReportsContext';
import { LanguageProvider } from './src/language/LanguageContext';
import { HomePlaceholderScreen } from './src/screens/HomePlaceholderScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { WorkerApp } from './src/screens/worker/WorkerApp';

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const logout = () => setProfile(null);

  return (
    <LanguageProvider>
      <ReportsProvider>
        {!profile ? (
          <LoginScreen onLoggedIn={setProfile} />
        ) : profile.role === 'worker' ? (
          <WorkerApp profile={profile} onLogout={logout} />
        ) : (
          <HomePlaceholderScreen profile={profile} onLogout={logout} />
        )}
        <StatusBar style="light" />
      </ReportsProvider>
    </LanguageProvider>
  );
}
