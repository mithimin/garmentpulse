'use client';

// apps/web/components/LanguageSwitch.tsx
//
// The small pill button in the top-right corner of every page. It shows ONLY the
// language the site is using now ("EN" for English, "বাং" for Bangla), and a click
// flips the whole site to the other language (design system section 6).
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
      {language === 'en' ? 'EN' : 'বাং'}
    </button>
  );
}
