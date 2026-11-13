'use client';

// apps/web/components/LoginParts.tsx
//
// The small building blocks of the login and sign-up pages, which are an exact copy of the
// login draft picture Mithi shared (see app/login.css for the sizes and colours):
//   - LoginShell:    the whole page: the photo, the words on the left (Smarter . Safer ...
//                    GarmentPulse, Manage. Monitor. Grow.) and the cream card on the right,
//   - CardBrand:     the logo, the two-colour name and the line "-- Manager Login --",
//   - PillField:     a round text box with an icon on its left,
//   - PasswordField: a PillField with a lock icon and an eye button that shows or hides it.
// Every box still has a label for screen readers (it is just not drawn, as in the picture).
// Owned by Mithi.

import { useId, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useLanguage } from '../language/LanguageContext';
import { screenText } from '../language/screenText';
import { LoginBar } from './LoginBar';

/** "GarmentPulse" in two colours: the first part brown, the second part baby blue. */
function useNameParts(): [string, string] {
  const { language } = useLanguage();
  return language === 'en' ? ['Garment', 'Pulse'] : ['গার্মেন্ট', 'পালস'];
}

export function LoginShell({
  activeRole,
  tall = false,
  children,
}: {
  /** On a login page: which role the page is for. Leave out on the sign-up page. */
  activeRole?: 'manager' | 'owner';
  /** A taller card (the sign-up page): leaves room above it so it never touches the top. */
  tall?: boolean;
  children: ReactNode;
}) {
  const { language } = useLanguage();
  const [first, second] = useNameParts();
  return (
    <main className="login-page">
      <LoginBar activeRole={activeRole} />
      <div className={tall ? 'login-stage login-stage-tall' : 'login-stage'}>
        <div className="login-intro">
          <p className="login-kicker">{screenText('loginKicker', language)}</p>
          <div className="login-intro-brand">
            <p className="login-wordmark" aria-hidden="true">
              {first}
              <span className="blue">{second}</span>
            </p>
            <p className="login-tagline">{screenText('loginTagline', language)}</p>
          </div>
        </div>
        {/* The wrapper carries the brown shape that shows behind the card's cut corner. */}
        <div className="login-card-wrap">
          <section className="login-card">{children}</section>
        </div>
      </div>
    </main>
  );
}

export function CardBrand({ title }: { title: string }) {
  const [first, second] = useNameParts();
  return (
    <>
      <span className="lc-logo" aria-hidden="true" />
      <h1 className="lc-wordmark">
        {first}
        <span className="blue">{second}</span>
      </h1>
      <div className="lc-title">
        <span>{title}</span>
      </div>
    </>
  );
}

type PillFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  icon: ReactNode;
  /** The name of the box for screen readers (it is not drawn). */
  label: string;
  /** Something at the right end of the box (the eye button). */
  trailing?: ReactNode;
};

export function PillField({ icon, label, trailing, ...input }: PillFieldProps) {
  const id = useId();
  return (
    <div className="lc-field">
      <label className="lc-sr" htmlFor={id}>
        {label}
      </label>
      <span className="lc-field-icon" aria-hidden="true">
        {icon}
      </span>
      <input id={id} className="lc-input" {...input} />
      {trailing}
    </div>
  );
}

export function PasswordField({
  label,
  ...input
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: string }) {
  const { language } = useLanguage();
  const [shown, setShown] = useState(false);
  return (
    <PillField
      {...input}
      label={label}
      type={shown ? 'text' : 'password'}
      icon={<Lock fill="currentColor" strokeWidth={1.8} />}
      trailing={
        <button
          type="button"
          className="lc-eye"
          aria-label={screenText(shown ? 'hidePassword' : 'showPassword', language)}
          aria-pressed={shown}
          onClick={() => setShown((value) => !value)}
        >
          {shown ? <Eye strokeWidth={1.8} /> : <EyeOff strokeWidth={1.8} />}
        </button>
      }
    />
  );
}
