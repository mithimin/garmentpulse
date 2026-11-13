// apps/web/components/PageArt.tsx
//
// A small picture in the top-right corner of a page's heading block (the title and the line
// under it). The pictures were cut out of the third draft picture Mithi shared
// (public/factory-art-*.webp): a pressing machine, tailor's scissors and a measuring tape.
// It only decorates: it is hidden from screen readers, cannot be clicked, and it sits ABOVE the
// cards, never behind or over a table. Put it as the first child of a `.greeting` block.
// The size and the places where it hides (small screens) are in app/factory.css.
// Owned by Mithi.

export type PageArtKind = 'press' | 'scissors' | 'tape';

export function PageArt({ kind }: { kind: PageArtKind }) {
  return <span className={`page-art page-art-${kind}`} aria-hidden="true" />;
}
