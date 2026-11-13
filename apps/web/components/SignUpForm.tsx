'use client';

// apps/web/components/SignUpForm.tsx
//
// The sign-up form (page /signup). The person types a full name, an email, a
// password and an INVITE CODE. The code decides the role (a manager code makes a
// manager), so there is no "who are you?" choice and nobody can pick their own
// role. Owners never sign up here (docs/mvp.md 2.1). With the real backend it uses
// the shared `signUpWithCode` (auth/realAuth.ts); without it, the fake sign-up
// (auth/fakeAuth.ts) is used. The look is an exact copy of the login draft picture
// (components/LoginParts.tsx and app/login.css). Owned by Mithi.

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Mail, ShieldCheck, Ticket, UserPlus, UserRound } from 'lucide-react';
import { CardBrand, LoginShell, PasswordField, PillField } from './LoginParts';
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
    <LoginShell tall>
      <CardBrand title={screenText('signupTagline', language)} />
      <form className="lc-form" onSubmit={handleSubmit} noValidate>
        <PillField
          icon={<UserRound strokeWidth={1.8} />}
          label={screenText('fullNameLabel', language)}
          autoComplete="name"
          placeholder={screenText('fullNameHint', language)}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
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
          autoComplete="new-password"
          placeholder={screenText('passwordPlainHint', language)}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PillField
          icon={<Ticket strokeWidth={1.8} />}
          label={screenText('inviteCodeLabel', language)}
          autoComplete="off"
          placeholder={screenText('codeHint', language)}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        {errorText ? (
          <p className="lc-error" role="alert">
            {errorText}
          </p>
        ) : null}
        <button className="lc-submit" type="submit" disabled={busy}>
          <UserPlus aria-hidden="true" strokeWidth={2} />
          {busy ? screenText('loading', language) : screenText('signupButton', language)}
        </button>
      </form>
      <div className="lc-or">
        <span>{screenText('orWord', language)}</span>
      </div>
      <p className="lc-switch">
        {screenText('haveAccount', language)}{' '}
        <Link href="/login">{screenText('loginLink', language)}</Link>
        <ChevronRight aria-hidden="true" strokeWidth={2.2} />
      </p>
      <p className="lc-secure">
        <ShieldCheck aria-hidden="true" strokeWidth={1.8} />
        {screenText('secureNote', language)}
      </p>
    </LoginShell>
  );
}
