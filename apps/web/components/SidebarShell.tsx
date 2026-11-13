'use client';

// apps/web/components/SidebarShell.tsx
//
// The frame around a set of pages that have a menu on the left: the denim top
// bar (with the button that opens and closes the menu), the sidebar with the
// menu links, and the page content beside it. The manager pages and the owner
// pages both use it, so the two roles behave the same way.
// On a big screen (tablet and up) the sidebar PUSHES the page, so the page is
// always fully visible beside it. On a phone it SLIDES OVER the page and also closes
// when you tap outside. On EVERY screen size the sidebar folds again as soon as its
// work is done (a menu page is picked) and also when you click or tap anywhere else
// on the screen, even if you never used the sidebar. Only the button in the top bar
// The sidebar ALWAYS starts folded, every time the page opens and after every login.
// It opens only when the person presses the button in the top bar. Nothing about it is
// remembered in the browser. Owned by Mithi.

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Role } from '@garmentpulse/shared';
import { useAuth } from '../auth/AuthContext';
import { Sidebar } from './Sidebar';
import type { MenuItem } from './Sidebar';
import { TopBar } from './TopBar';

type SidebarShellProps = {
  /** The role shown on the nameplate in the top bar. */
  role: Role;
  menu: MenuItem[];
  children: ReactNode;
};

export function SidebarShell({ role, menu, children }: SidebarShellProps) {
  const { logOut } = useAuth();
  // Always folded to begin with. Only the button in the top bar opens it.
  const [open, setOpen] = useState(false);

  // While the sidebar is open, a click or tap ANYWHERE outside it folds it. The toggle
  // button in the top bar is left out, because it opens and closes the sidebar itself.
  useEffect(() => {
    if (!open) return;
    function foldOnOutsideClick(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('.sidebar') || target.closest('[data-sidebar-toggle]')) return;
      setOpen(false);
    }
    document.addEventListener('pointerdown', foldOnOutsideClick);
    return () => document.removeEventListener('pointerdown', foldOnOutsideClick);
  }, [open]);

  function toggle() {
    setOpen(!open);
  }

  return (
    <>
      <TopBar role={role} onLogOut={logOut} onToggleSidebar={toggle} sidebarOpen={open} />
      <div className={open ? 'shell shell-open' : 'shell'}>
        {open ? (
          <>
            <Sidebar menu={menu} onLogOut={logOut} onNavigate={() => setOpen(false)} />
            {/* On a phone the sidebar covers the page, so a tap outside closes it. */}
            <div className="sidebar-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
          </>
        ) : null}
        <main className="page">{children}</main>
      </div>
    </>
  );
}
