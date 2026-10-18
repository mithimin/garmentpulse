'use client';

// apps/web/language/LanguageContext.tsx
//
// Remembers which language the website is showing (English or Bangla) and lets
// any page read it or change it. The site shows ONE language at a time
// (design system section 6). The small switch in the top-right corner changes it.
// The <html lang> tag is updated too, so the Bangla line height and the
// "no capital letters" rules in globals.css switch on.
// The chosen language is also saved in the browser (localStorage), so it is still there after a
// page refresh. If the browser blocks saving (for example a private window), the site simply
// starts in English again each time. Owned by Mithi.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Language } from '@garmentpulse/shared';

type LanguageValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageValue | null>(null);

/** The key the chosen language is saved under in the browser. */
const STORAGE_KEY = 'garmentpulse-web-language';

/** Reads the saved language. Returns null if nothing is saved or the browser blocks reading. */
function readSavedLanguage(): Language | null {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === 'en' || saved === 'bn' ? saved : null;
  } catch {
    return null;
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // The server always starts in English. The saved language is applied right after the first
  // draw in the browser, so the server's page and the browser's first draw match.
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = readSavedLanguage();
    if (saved) setLanguageState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Saving is only a convenience, so a blocked browser is fine.
    }
  }, []);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/** Gives a page the current language and a way to change it. */
export function useLanguage(): LanguageValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return value;
}
