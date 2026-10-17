// apps/web/components/Card.tsx
//
// A box that holds ONE idea (one report, one list). It has a thin solid edge and
// a dashed "stitch" line just inside it (design system sections 8 and 9.2).
// Owned by Mithi.

import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`.trim()}>{children}</section>;
}
