// apps/mobile/App.tsx
//
// The main component of GarmentPulse Mobile (workers and technicians).
// It decides which screen to show:
//   - nobody logged in  -> the login screen
//   - somebody logged in -> a temporary home screen (real worker and technician
//     screens come in the next steps)
// It also wraps everything in the language holder, so every screen can read and
// change the chosen language (English or Bangla).
// Owned by Rubaiya.

import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import type { Profile } from '@garmentpulse/shared';
import { LanguageProvider } from './src/language/LanguageContext';
import { HomePlaceholderScreen } from './src/screens/HomePlaceholderScreen';
import { LoginScreen } from './src/screens/LoginScreen';

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);

  return (
    <LanguageProvider>
      {profile ? (
        <HomePlaceholderScreen profile={profile} onLogout={() => setProfile(null)} />
      ) : (
        <LoginScreen onLoggedIn={setProfile} />
      )}
      <StatusBar style="light" />
    </LanguageProvider>
  );
}
