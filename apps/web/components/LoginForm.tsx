'use client';

// apps/web/components/LoginForm.tsx
//
// The login form shared by the TWO login pages: /login (managers) and
// /owner-login (the owner). Each page says which role it is for, and only that
// role can get in through it (MVP 2.1). The person types an email
// and a password. On success they go to their own start page. If the account
// belongs to a worker or technician, we show the WRONG_PLATFORM sentence and do
// not log them in (they use the phone app). Right now the login is FAKE (see
// auth/fakeAuth.ts); the real one comes with Sakib's backend.
// Owned by Mithi.

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field, TextInput } from '../components/Field';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { Logo } from '../components/Logo';
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
    <main className="login-page">
      <div className="login-corner">
        <LanguageSwitch />
      </div>
      <div className="login-box">
        <div className="login-brand">
          <Logo size={72} light />
          <h1>{screenText('appName', language)}</h1>
          <p>{screenText(role === 'owner' ? 'ownerTagline' : 'managerTagline', language)}</p>
        </div>
        <Card>
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <Field label={screenText('emailLabel', language)}>
              {(id) => (
                <TextInput
                  id={id}
                  type="email"
                  autoComplete="username"
                  placeholder={screenText('emailHint', language)}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              )}
            </Field>
            <Field label={screenText('passwordLabel', language)}>
              {(id) => (
                <TextInput
                  id={id}
                  type="password"
                  autoComplete="current-password"
                  placeholder={screenText('passwordHint', language)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
            </Field>
            {errorText ? (
              <p className="field-error" role="alert">
                {errorText}
              </p>
            ) : null}
            <Button kind="main" type="submit" disabled={busy}>
              {busy ? screenText('loading', language) : screenText('loginButton', language)}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
