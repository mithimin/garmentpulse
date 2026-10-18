// apps/mobile/App.tsx
//
// The main component of GarmentPulse Mobile (workers and technicians).
// It decides which screen to show:
//   - nobody logged in       -> the login screen
//   - a worker logged in     -> the worker screens (Home, Report, My reports)
//   - a technician logged in -> the technician screens (Jobs, History)
// It also wraps everything in two "holders": one remembers the chosen language
// (English or Bangla), the other (only once someone is logged in) holds that
// person's reports from the real backend.
// Owned by Rubaiya.

import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import type { Profile } from '@garmentpulse/shared';
import { logout as backendLogout } from './src/auth/realAuth';
import { ReportsProvider } from './src/data/ReportsContext';
import { LanguageProvider } from './src/language/LanguageContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { TechnicianApp } from './src/screens/technician/TechnicianApp';
import { WorkerApp } from './src/screens/worker/WorkerApp';

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const logout = () => {
    setProfile(null);
    void backendLogout();
  };

  return (
    <LanguageProvider>
      {!profile ? (
        <LoginScreen onLoggedIn={setProfile} />
      ) : (
        // `key` makes a fresh holder for each person, so nobody sees the last person's data.
        <ReportsProvider key={profile.id} profile={profile}>
          {profile.role === 'worker' ? (
            <WorkerApp profile={profile} onLogout={logout} />
          ) : (
            <TechnicianApp profile={profile} onLogout={logout} />
          )}
        </ReportsProvider>
      )}
      <StatusBar style="light" />
    </LanguageProvider>
  );
}
