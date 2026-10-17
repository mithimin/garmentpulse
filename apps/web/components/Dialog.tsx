'use client';

// apps/web/components/Dialog.tsx
//
// The frame of a pop-up box: a dark area over the page with a card in the middle.
// It closes with the Escape key or a click on the dark area. The Assign box and the
// report details box both use it, so they behave the same. Owned by Mithi.

import { useEffect } from 'react';
import type { ReactNode } from 'react';

export function Dialog({
  label,
  onClose,
  children,
}: {
  /** A short name for screen readers, for example "Assign a technician". */
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
