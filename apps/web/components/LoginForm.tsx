'use client';

// apps/web/components/LoginForm.tsx
//
// The login form shared by the TWO login pages: /login (managers) and
// /owner-login (the owner). Each page says which role it is for, and only that
// role can get in through it (MVP 2.1). The person types an email
// and a password. On success they go to their own start page. If the account
// belongs to a worker or technician, we show the WRONG_PLATFORM sentence and do
// not log them in (they use the phone app). Managers also get a "Sign up" link to
// /signup (the owner never signs up). The look is an exact copy of the login draft picture
// (components/LoginParts.tsx and app/login.css). With the real backend it uses the real
// login; without it, the fake login (auth/fakeAuth.ts).
// Owned by Mithi.

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { CardBrand, LoginShell, PasswordField, PillField } from '../components/LoginParts';
import { useAuth } from '../auth/AuthContext';
import { homePathFor } from '../auth/homePath';
import { useLanguage } from '../language/LanguageContext';
import { errorSentence } from '../language/errorText';
import { screenText } from '../language/screenText';

export function LoginForm({ role }: { role: 'manager' | 'owner' }) {
  const { logIn } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setErrorText('');
    try {
      const person = await logIn(email, password, role);
      router.replace(homePathFor(person.role));
    } catch (error) {
      setErrorText(errorSentence(error, language));
      setBusy(false);
    }
  }

  return (
    <LoginShell activeRole={role}>
      <CardBrand
        title={screenText(role === 'owner' ? 'ownerLoginTitle' : 'managerLoginTitle', language)}
      />
      <form className="lc-form" onSubmit={handleSubmit} noValidate>
        <PillField
          icon={<Mail strokeWidth={1.8} />}
          label={screenText('emailLabel', language)}
          type="email"
          autoComplete="username"
          placeholder={screenText('emailAddressHint', language)}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordField
          label={screenText('passwordLabel', language)}
          autoComplete="current-password"
          placeholder={screenText('passwordPlainHint', language)}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errorText ? (
          <p className="lc-error" role="alert">
            {errorText}
          </p>
        ) : null}
        <button className="lc-submit" type="submit" disabled={busy}>
          <LogIn aria-hidden="true" strokeWidth={2} />
          {busy ? screenText('loading', language) : screenText('loginButton', language)}
        </button>
      </form>
      {role === 'owner' ? null : (
        <>
          <div className="lc-or">
            <span>{screenText('orWord', language)}</span>
          </div>
          <p className="lc-switch">
            {screenText('newHere', language)}{' '}
            <Link href="/signup">{screenText('signupLink', language)}</Link>
            <ChevronRight aria-hidden="true" strokeWidth={2.2} />
          </p>
        </>
      )}
      <p className="lc-secure">
        <ShieldCheck aria-hidden="true" strokeWidth={1.8} />
        {screenText('secureNote', language)}
      </p>
    </LoginShell>
  );
}
