'use client';

// apps/web/components/SidebarShell.tsx
//
// The frame around a set of pages that have a menu on the left: the denim top
// bar (with the button that opens and closes the menu), the sidebar with the
// menu links, and the page content beside it. The manager pages and the owner
// pages both use it, so the two roles behave the same way.
// On a big screen (tablet and up) the sidebar PUSHES the page, so the page is
// always fully visible beside it. On a phone it SLIDES OVER the page and closes
// when you pick a page or tap outside. The big-screen choice (open or closed) is
// remembered in this browser. Owned by Mithi.

import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Role } from '@garmentpulse/shared';
import { useAuth } from '../auth/AuthContext';
import { Sidebar } from './Sidebar';
import type { MenuItem } from './Sidebar';
import { TopBar } from './TopBar';

const STORAGE_KEY = 'garmentpulse-web-sidebar-open';
/** Below this width the sidebar slides over the page instead of pushing it. */
const PHONE_QUERY = '(max-width: 767px)';

function isPhone(): boolean {
  return window.matchMedia(PHONE_QUERY).matches;
}

/** Open on a big screen unless the person closed it before; closed on a phone. */
function startOpen(): boolean {
  if (isPhone()) return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'closed';
  } catch {
    return true;
  }
}

type SidebarShellProps = {
  /** The role shown on the nameplate in the top bar. */
  role: Role;
  menu: MenuItem[];
  children: ReactNode;
};

export function SidebarShell({ role, menu, children }: SidebarShellProps) {
  const { logOut } = useAuth();
  // This frame only draws in the browser (after the role door), so reading the
  // screen size here is safe.
  const [open, setOpen] = useState(startOpen);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (!isPhone()) {
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? 'open' : 'closed');
      } catch {
        // Not remembering is fine.
      }
    }
  }

  return (
    <>
      <TopBar role={role} onLogOut={logOut} onToggleSidebar={toggle} sidebarOpen={open} />
      <div className={open ? 'shell shell-open' : 'shell'}>
        {open ? (
          <>
            <Sidebar
              menu={menu}
              onLogOut={logOut}
              onNavigate={() => {
                if (isPhone()) setOpen(false);
              }}
            />
            {/* On a phone the sidebar covers the page, so a tap outside closes it. */}
            <div className="sidebar-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
          </>
        ) : null}
        <main className="page">{children}</main>
      </div>
    </>
  );
}
