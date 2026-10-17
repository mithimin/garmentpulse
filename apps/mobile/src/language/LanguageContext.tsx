// apps/mobile/src/language/LanguageContext.tsx
//
// Remembers which language the app is showing (English or Bangla) and lets any
// screen read it or change it. The app shows ONE language at a time
// (design system section 6). The small switch in the top-right corner changes it.
// Owned by Rubaiya.

import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Language } from '@garmentpulse/shared';

type LanguageValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const value = useMemo(() => ({ language, setLanguage }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/** Gives a screen the current language and a way to change it. */
export function useLanguage(): LanguageValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return value;
}
