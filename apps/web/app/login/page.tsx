'use client';

// apps/web/app/login/page.tsx
//
// The MANAGER login page. The owner has a separate page (/owner-login) that is
// not linked from here. Owned by Mithi.

import { LoginForm } from '../../components/LoginForm';

export default function ManagerLoginPage() {
  return <LoginForm role="manager" />;
}
