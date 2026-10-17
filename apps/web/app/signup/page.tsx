'use client';

// apps/web/app/signup/page.tsx
//
// The sign-up page for new managers and owners. A manager needs a one-time code
// from the owner; an owner needs the owner code. This is FAKE only: the real
// backend has no sign-up (Sakib creates the accounts), so when the real backend
// is connected this page only explains that sign-up is closed. Owned by Mithi.

import Link from 'next/link';
import { Card } from '../../components/Card';
import { LoginBar } from '../../components/LoginBar';
import { Logo } from '../../components/Logo';
import { SignUpForm } from '../../components/SignUpForm';
import { useLanguage } from '../../language/LanguageContext';
import { screenText } from '../../language/screenText';
import { backendIsReal } from '../../lib/backend';

export default function SignUpPage() {
  return backendIsReal ? <SignUpClosed /> : <SignUpForm />;
}

function SignUpClosed() {
  const { language } = useLanguage();
  return (
    <main className="login-page">
      <LoginBar />
      <div className="login-box">
        <div className="login-brand">
          <Logo size={72} />
          <h1>{screenText('appName', language)}</h1>
        </div>
        <Card>
          <h2>{screenText('signupClosedTitle', language)}</h2>
          <p>{screenText('signupClosedText', language)}</p>
        </Card>
        <div className="login-help">
          <p>
            <Link href="/login" className="login-link">
              {screenText('loginLink', language)}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
