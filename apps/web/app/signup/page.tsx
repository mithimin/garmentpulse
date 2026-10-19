'use client';

// apps/web/app/signup/page.tsx
//
// The sign-up page for new managers. A manager needs a one-time invite code from
// the owner (docs/api-contract.md 4.7). The form works with the real backend and
// with the fake codes, depending on lib/backend.ts. Owners never sign up here.
// Owned by Mithi.

import { SignUpForm } from '../../components/SignUpForm';

export default function SignUpPage() {
  return <SignUpForm />;
}
