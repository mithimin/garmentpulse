'use client';

// apps/web/components/Dialog.tsx
//
// The frame of a pop-up box: a dark area over the page with a card in the middle.
// It closes with the Escape key or a click on the dark area. The Assign box, the
// report details box and the repair cost box all use it, so they behave the same.
// `wide` makes a bigger box that scrolls inside itself (for the photos).
// The box is placed straight on the page body (a "portal"). Otherwise the top bar
// would cover its top, and a glass card could trap it inside itself.
// Owned by Mithi.

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function Dialog({
  label,
  onClose,
  children,
  wide = false,
}: {
  /** A short name for screen readers, for example "Assign a technician". */
  label: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  // A pop-up only opens after a click, so the page body always exists here.
  return createPortal(
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <div
        className={wide ? 'dialog dialog-wide' : 'dialog'}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
