'use client';

// apps/web/components/StatusAlerts.tsx
//
// Shows a small pop-up message to the manager when a report's status changes
// (for example "Waiting" to "In progress"), so the manager sees it without a
// refresh. It watches the shared list of reports that the manager layout already
// keeps live (data/ManagerData.tsx). The first list the page loads is only
// remembered, not announced, so old reports do not pop up when the page opens.
// Each message goes away by itself after a few seconds, or when the manager closes it.
// Owned by Mithi.

import { useEffect, useRef, useState } from 'react';
import type { Report, ReportStatus } from '@garmentpulse/shared';
import { STATUS_LABELS } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';
import { screenText } from '../language/screenText';
import { useNotifications } from '../data/NotificationsData';

type Alert = { id: number; text: string };

const SHOW_SECONDS = 6;

export function StatusAlerts({ reports }: { reports: Report[] | null }) {
  const { language } = useLanguage();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  // The last known status of each report. null until the first list has arrived.
  const knownRef = useRef<Map<string, ReportStatus> | null>(null);
  const nextIdRef = useRef(0);
  // The same messages also go to the bell's list in the top bar.
  const { add: addNotice } = useNotifications();

  useEffect(() => {
    if (!reports) return;
    const previous = knownRef.current;
    const current = new Map(reports.map((report) => [report.id, report.status]));
    knownRef.current = current;
    if (!previous) return; // the first load: remember only, announce nothing

    const fresh: Alert[] = [];
    for (const report of reports) {
      const before = previous.get(report.id);
      if (before === undefined || before === report.status) continue;
      nextIdRef.current += 1;
      const text = `${report.machine.name}: ${STATUS_LABELS[report.status][language]}`;
      fresh.push({ id: nextIdRef.current, text });
      addNotice(text);
    }
    if (fresh.length > 0) setAlerts((list) => [...list, ...fresh]);
  }, [reports, language, addNotice]);

  // Each alert leaves by itself after a few seconds.
  useEffect(() => {
    if (alerts.length === 0) return;
    const timer = setTimeout(() => setAlerts((list) => list.slice(1)), SHOW_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [alerts]);

  if (alerts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 50,
        display: 'grid',
        gap: 8,
        maxWidth: 320,
      }}
    >
      {alerts.map((alert) => (
        <div
          key={alert.id}
          style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderLeft: '4px solid #2563eb',
            borderRadius: 8,
            padding: '10px 12px',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>
            <strong>{screenText('alertTitle', language)}</strong>
            <br />
            {alert.text}
          </span>
          <button
            type="button"
            aria-label={screenText('alertClose', language)}
            onClick={() => setAlerts((list) => list.filter((item) => item.id !== alert.id))}
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18 }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
