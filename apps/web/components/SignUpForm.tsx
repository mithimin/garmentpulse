'use client';

// apps/web/components/SignUpForm.tsx
//
// The sign-up form (page /signup). The person types a full name, an email and a
// password, then says if they are a manager or an owner. Then one more box
// appears for a secret code:
//   - a MANAGER needs a one-time code (OTP) that the owner created, so a manager
//     cannot get in without the owner's say-so;
//   - an OWNER needs the owner code.
// Right now this is FAKE (see auth/fakeAuth.ts and auth/fakeAccounts.ts); the
// real sign-up comes with Sakib's backend. Owned by Mithi.

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from './Button';
import { Card } from './Card';
import { Field, SelectInput, TextInput } from './Field';
import { LoginBar } from './LoginBar';
import { Logo } from './Logo';
import { ROLE_LABELS } from '@garmentpulse/shared';
import { useAuth } from '../auth/AuthContext';
import { homePathFor } from '../auth/homePath';
import { useLanguage } from '../language/LanguageContext';
import { errorSentence } from '../language/errorText';
import { screenText } from '../language/screenText';

type SignUpRole = '' | 'manager' | 'owner';

export function SignUpForm() {
  const { signUp } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<SignUpRole>('');
  const [code, setCode] = useState('');
  const [errorText, setErrorText] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (role === '') {
      setErrorText(errorSentence(new Error('INVALID_INPUT'), language));
      return;
    }
    setBusy(true);
    setErrorText('');
    try {
      const person = await signUp({ fullName, email, password, role, code });
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
            <Field label={screenText('roleQuestion', language)}>
              {(id) => (
                <SelectInput
                  id={id}
                  value={role}
                  onChange={(e) => setRole(e.target.value as SignUpRole)}
                >
                  <option value="">{screenText('roleChoose', language)}</option>
                  <option value="manager">{ROLE_LABELS.manager[language]}</option>
                  <option value="owner">{ROLE_LABELS.owner[language]}</option>
                </SelectInput>
              )}
            </Field>
            {role !== '' ? (
              <Field
                label={screenText(
                  role === 'manager' ? 'managerCodeLabel' : 'ownerCodeLabel',
                  language,
                )}
              >
                {(id) => (
                  <TextInput
                    id={id}
                    autoComplete="one-time-code"
                    placeholder={screenText('codeHint', language)}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                )}
              </Field>
            ) : null}
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
            <Link href={role === 'owner' ? '/owner-login' : '/login'} className="login-link">
              {screenText('loginLink', language)}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
