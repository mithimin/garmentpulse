'use client';

// apps/web/app/page.tsx
//
// The front door of GarmentPulse Web. It shows nothing itself: it sends a
// logged-in person to their start page (manager or owner) and everyone else to
// the login page. Owned by Mithi.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth/AuthContext';
import { homePathFor } from '../auth/homePath';
import { LoadingMessage } from '../components/StateMessage';

export default function HomePage() {
  const { profile, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    router.replace(profile ? homePathFor(profile.role) : '/login');
  }, [ready, profile, router]);

  return (
    <main className="page">
      <LoadingMessage />
    </main>
  );
}
