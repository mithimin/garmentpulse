// apps/mobile/src/components/useNow.ts
//
// Gives a screen the current time and makes it redraw every little while, so a
// live counter like "Down for 12 min" keeps moving without the person touching
// the screen.
// Owned by Rubaiya.

import { useEffect, useState } from 'react';

export function useNow(everyMilliseconds = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), everyMilliseconds);
    return () => clearInterval(timer);
  }, [everyMilliseconds]);
  return now;
}
