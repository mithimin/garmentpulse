'use client';

// apps/web/app/not-found.tsx
//
// The page people see when they type an address that does not exist.
// It says so in plain words and offers a way back to the start.
// Owned by Mithi.

import Link from 'next/link';
import { Card } from '../components/Card';
import { TopBar } from '../components/TopBar';
import { useLanguage } from '../language/LanguageContext';
import { screenText } from '../language/screenText';

export default function NotFoundPage() {
  const { language } = useLanguage();
  return (
    <>
      <TopBar />
      <main className="page">
        <Card>
          <h2>{screenText('notFoundTitle', language)}</h2>
          <p>{screenText('notFoundText', language)}</p>
          <Link href="/" className="btn btn-main">
            {screenText('goToStart', language)}
          </Link>
        </Card>
      </main>
    </>
  );
}
