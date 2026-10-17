'use client';

// apps/web/app/owner-login/page.tsx
//
// The OWNER login page. It is a separate address that the manager login page
// does not link to, so managers do not see it. Owned by Mithi.

import { LoginForm } from '../../components/LoginForm';

export default function OwnerLoginPage() {
  return <LoginForm role="owner" />;
}
