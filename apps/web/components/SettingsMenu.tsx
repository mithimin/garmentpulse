'use client';

// apps/web/components/SettingsMenu.tsx
//
// The "Settings" button on the login pages. Clicking it opens a small box that
// holds the language choice (English or Bangla). It closes when the person
// clicks somewhere else or presses Escape. Right now Language is the only
// setting. Owned by Mithi.

import { useEffect, useRef, useState } from 'react';
import { Settings } from 'lucide-react';
import type { Language } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';
import { screenText } from '../language/screenText';

const CHOICES: { language: Language; name: string }[] = [
  { language: 'en', name: 'English' },
  { language: 'bn', name: 'বাংলা' },
];

export function SettingsMenu() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function closeOnOutsideClick(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div className="settings-wrap" ref={wrapRef}>
      <button
        type="button"
        className="settings-btn"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
      >
        <Settings size={16} strokeWidth={1.8} aria-hidden="true" />
        {screenText('settings', language)}
      </button>
      {open ? (
        <div className="settings-panel" role="group" aria-label={screenText('settings', language)}>
          <div className="settings-title">{screenText('languageSetting', language)}</div>
          <div className="settings-choices">
            {CHOICES.map((choice) => (
              <button
                key={choice.language}
                type="button"
                className={
                  choice.language === language
                    ? 'settings-choice settings-choice-active'
                    : 'settings-choice'
                }
                aria-pressed={choice.language === language}
                onClick={() => setLanguage(choice.language)}
              >
                {choice.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
