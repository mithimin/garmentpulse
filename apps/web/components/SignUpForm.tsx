'use client';

// apps/web/components/SignUpForm.tsx
//
// The sign-up form (page /signup). The person types a full name, an email, a
// password and an INVITE CODE. The code decides the role (a manager code makes a
// manager), so there is no "who are you?" choice and nobody can pick their own
// role. Owners never sign up here (docs/mvp.md 2.1). With the real backend it uses
// the shared `signUpWithCode` (auth/realAuth.ts); without it, the fake sign-up
// (auth/fakeAuth.ts) is used. Owned by Mithi.

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from './Button';
import { Card } from './Card';
import { Field, TextInput } from './Field';
import { LoginBar } from './LoginBar';
import { Logo } from './Logo';
import { useAuth } from '../auth/AuthContext';
import { homePathFor } from '../auth/homePath';
import { useLanguage } from '../language/LanguageContext';
import { errorSentence } from '../language/errorText';
import { screenText } from '../language/screenText';

export function SignUpForm() {
  const { signUp } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [errorText, setErrorText] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    // A short password gets its own clear sentence (the same 6-letter rule as the fake sign-up).
    if (password !== '' && password.length < 6) {
      setErrorText(screenText('passwordTooShort', language));
      return;
    }
    setBusy(true);
    setErrorText('');
    try {
      const person = await signUp({ fullName, email, password, code });
      router.replace(homePathFor(person.role));
    } catch (error) {
      setErrorText(errorSentence(error, language));
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <LoginBar />
      <div className="login-box">
        <div className="login-brand">
          <Logo size={72} />
          <h1>{screenText('appName', language)}</h1>
          <p>{screenText('signupTagline', language)}</p>
        </div>
        <Card>
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <Field label={screenText('fullNameLabel', language)}>
              {(id) => (
                <TextInput
                  id={id}
                  autoComplete="name"
                  placeholder={screenText('fullNameHint', language)}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              )}
            </Field>
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
                  autoComplete="new-password"
                  placeholder={screenText('passwordHint', language)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
            </Field>
            <Field label={screenText('inviteCodeLabel', language)}>
              {(id) => (
                <TextInput
                  id={id}
                  autoComplete="off"
                  placeholder={screenText('codeHint', language)}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              )}
            </Field>
            {errorText ? (
              <p className="field-error" role="alert">
                {errorText}
              </p>
            ) : null}
            <Button kind="main" type="submit" disabled={busy}>
              {busy ? screenText('loading', language) : screenText('signupButton', language)}
            </Button>
          </form>
        </Card>
        <div className="login-help">
          <p>
            {screenText('haveAccount', language)}{' '}
            <Link href="/login" className="login-link">
              {screenText('loginLink', language)}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
