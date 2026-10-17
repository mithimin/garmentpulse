'use client';

// apps/web/language/LanguageContext.tsx
//
// Remembers which language the website is showing (English or Bangla) and lets
// any page read it or change it. The site shows ONE language at a time
// (design system section 6). The small switch in the top-right corner changes it.
// The <html lang> tag is updated too, so the Bangla line height and the
// "no capital letters" rules in globals.css switch on.
// Owned by Mithi.

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Language } from '@garmentpulse/shared';

type LanguageValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/** Gives a page the current language and a way to change it. */
export function useLanguage(): LanguageValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return value;
}
