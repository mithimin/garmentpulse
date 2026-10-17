'use client';

// apps/web/components/LanguageSwitch.tsx
//
// The small pill button in the top-right corner of every page. It shows
// "EN · বাং" and flips the whole site between English and Bangla
// (design system section 6).
// Owned by Mithi.

import { useLanguage } from '../language/LanguageContext';
import { screenText } from '../language/screenText';

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();
  return (
    <button
      type="button"
      className="lang-switch"
      aria-label={screenText('languageSwitchName', language)}
      onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
    >
      EN · বাং
    </button>
  );
}
