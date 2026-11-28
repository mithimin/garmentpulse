'use client';

// apps/web/components/TopBar.tsx
//
// The brown bar along the top of every page after login (design system 9.5):
//   - left:   a button that opens and closes the sidebar (only when a page passes
//             `onToggleSidebar`; the owner's one-screen page has no sidebar),
//   - middle: the nameplate: the logo, the app name and the role name,
//   - right:  the language switch and (when someone is logged in) a Log out button.
// A dashed gold stitch line runs along the bottom edge. The menu links live in
// the sidebar (components/Sidebar.tsx), not here.
// Pass `role` to show the role name; pass `onLogOut` to show the Log out button.
// When a page has a sidebar (`onToggleSidebar`), Log out lives at the bottom of the
// sidebar instead, so the bar does not show it twice.
// Owned by Mithi.

import { useEffect, useRef, useState } from 'react';
import { Bell, LogOut, Menu } from 'lucide-react';
import type { Role } from '@garmentpulse/shared';
import { ROLE_LABELS } from '@garmentpulse/shared';
import { useNotifications } from '../data/NotificationsData';
import { localizeDigits } from '../language/format';
import { useLanguage } from '../language/LanguageContext';
import { screenText } from '../language/screenText';
import { LanguageSwitch } from './LanguageSwitch';

type TopBarProps = {
  role?: Role;
  onLogOut?: () => void;
  /** Shows the sidebar button on the left. */
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
};

/**
 * The bell: the notification symbol. It shows how many new notices arrived and, when opened,
 * a list of all of them (newest first). Opening it marks them as read. The list comes from
 * data/NotificationsData.tsx, which the status pop-ups feed.
 */
function NotificationBell() {
  const { language } = useLanguage();
  const { notices, unread, markAllRead, clear } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // A click anywhere outside the bell and its list closes the list.
  useEffect(() => {
    if (!open) return;
    function closeOnOutsideClick(event: PointerEvent) {
      if (
        wrapRef.current &&
        event.target instanceof Node &&
        !wrapRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [open]);

  function toggle() {
    if (!open) markAllRead();
    setOpen(!open);
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="icon-btn"
        aria-label={screenText('notificationsName', language)}
        aria-expanded={open}
        title={screenText('notificationsName', language)}
        onClick={toggle}
        style={{ position: 'relative' }}
      >
        <Bell size={24} strokeWidth={2} aria-hidden="true" />
        {unread > 0 ? (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 20,
              height: 20,
              padding: '0 5px',
              borderRadius: 10,
              background: '#dc2626',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {localizeDigits(String(unread), language)}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          role="region"
          aria-label={screenText('notificationsName', language)}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 300,
            maxHeight: 360,
            overflowY: 'auto',
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.2)',
            zIndex: 60,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 12px',
              borderBottom: '1px solid #e2e8f0',
              fontWeight: 700,
            }}
          >
            <span>{screenText('notificationsName', language)}</span>
            {notices.length > 0 ? (
              <button
                type="button"
                onClick={clear}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#2563eb' }}
              >
                {screenText('notificationsClear', language)}
              </button>
            ) : null}
          </div>
          {notices.length === 0 ? (
            <p style={{ margin: 0, padding: '12px', color: '#64748b' }}>
              {screenText('notificationsEmpty', language)}
            </p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {notices.map((notice) => (
                <li
                  key={notice.id}
                  style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}
                >
                  <div>{notice.text}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {localizeDigits(
                      new Date(notice.at).toLocaleTimeString(
                        language === 'bn' ? 'bn-BD' : 'en-GB',
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        },
                      ),
                      language,
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function TopBar({ role, onLogOut, onToggleSidebar, sidebarOpen = false }: TopBarProps) {
  const { language } = useLanguage();
  return (
    <header className={onToggleSidebar ? 'topbar topbar-has-sidebar' : 'topbar'}>
      <div className="topbar-left">
        {onToggleSidebar ? (
          <button
            type="button"
            className="icon-btn"
            data-sidebar-toggle="true"
            aria-label={screenText('sidebarToggle', language)}
            aria-expanded={sidebarOpen}
            onClick={onToggleSidebar}
          >
            <Menu size={26} strokeWidth={2.2} aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <div className="topbar-brand">
        {/* The logo tile is the picture public/factory-logo-tile.png (set in factory.css). */}
        <span className="logo-tile" aria-hidden="true" />
        <div className="topbar-nameplate">
          <div className="topbar-name">{screenText('appName', language)}</div>
          {role ? <div className="topbar-role">{ROLE_LABELS[role][language]}</div> : null}
        </div>
      </div>
      <div className="topbar-right">
        {onLogOut && !onToggleSidebar ? (
          <button
            type="button"
            className="btn btn-small"
            aria-label={screenText('logOut', language)}
            onClick={onLogOut}
          >
            <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
            <span className="btn-label">{screenText('logOut', language)}</span>
          </button>
        ) : null}
        <NotificationBell />

        {/* The language switch lives in the sidebar on pages that have one. */}
        {!onToggleSidebar ? <LanguageSwitch /> : null}
      </div>
    </header>
  );
}
