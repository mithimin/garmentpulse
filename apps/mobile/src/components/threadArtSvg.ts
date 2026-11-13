// apps/mobile/src/components/threadArtSvg.ts
//
// Builds the drawing for the bottom of the login screen, as SVG text: a loose
// blue thread that comes from the spool, loops once and swoops across the cloth.
// The thread has a shadow on the cloth, a dark edge, its colour, a shine
// and a thin twist line, so it looks like real thread.
// It is plain text so it can be shown in the app (by `BottomDecoration.tsx`) and
// also turned into a preview picture while we design it.
// Owned by Rubaiya.

/** The drawing is made on a 393 x 100 canvas (about the width of a phone). */
export const THREAD_ART_WIDTH = 393;
export const THREAD_ART_HEIGHT = 100;

/** The thread: it leaves the spool at the left, makes one loop, and goes on to the right. */
const THREAD =
  'M92 86 C112 70 128 98 150 86 C172 74 196 64 190 52 C184 40 160 50 168 66 C176 82 214 92 246 82 C286 70 320 92 362 74 S393 66 393 68';

/** The whole picture as SVG text. */
export function threadArtSvg(): string {
  const thread = `
<path d="${THREAD}" fill="none" stroke="#1F120B" stroke-opacity=".24" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round" transform="translate(2 5)"/>
<path d="${THREAD}" fill="none" stroke="#3F6A9A" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="${THREAD}" fill="none" stroke="#7FAEE0" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/>
<path d="${THREAD}" fill="none" stroke="#FFFFFF" stroke-opacity=".4" stroke-width=".9" stroke-linecap="round" stroke-dasharray="1.6 2.4"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${THREAD_ART_WIDTH}" height="${THREAD_ART_HEIGHT}" viewBox="0 0 ${THREAD_ART_WIDTH} ${THREAD_ART_HEIGHT}">${thread}</svg>`;
}
