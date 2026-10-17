// apps/web/components/DataTable.tsx
//
// The table wrapper (design system section 9.7). It gives the dark header row,
// the dashed lines between rows, and sideways scrolling INSIDE its box on a
// narrow window, so the page itself never scrolls sideways. Pages write their
// own <thead> and <tbody> inside it. Put IDs in a cell with class "code" and
// the action button in a cell with class "actions".
// With `stack` on, a table that gets too narrow turns each row into a small card
// (no sideways scrolling), using each cell's `data-label` as its small heading.
// Owned by Mithi.

import type { ReactNode } from 'react';

export function DataTable({ children, stack = false }: { children: ReactNode; stack?: boolean }) {
  return (
    <div className="table-wrap">
      <table className={stack ? 'table table-stack' : 'table'}>{children}</table>
    </div>
  );
}
