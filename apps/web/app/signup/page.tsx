'use client';

// apps/web/app/signup/page.tsx
//
// The sign-up page for new managers and owners. A manager needs a one-time code
// from the owner; an owner needs the owner code. Owned by Mithi.

import { SignUpForm } from '../../components/SignUpForm';

export default function SignUpPage() {
  return <SignUpForm />;
}
