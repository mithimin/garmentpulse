// apps/mobile/src/components/logoArtSvg.ts
//
// Builds the GarmentPulse logo as SVG text: a realistic sewing machine.
// It is kept as plain text on purpose, so the exact same drawing can be shown in
// the app (by `Logo.tsx`), turned into a preview picture while we design it, and
// used to make the app icon files. The machine has:
//   - a brown body with a real machine outline (curved arm, rounded head, curved
//     throat and a flared base), shaded like glossy enamel;
//   - real-looking metal: a chrome tension dial and stitch dial with ticks around
//     the edge, small slotted screws, a needle clamp, a presser foot, a bed plate
//     with a slide cover, a chrome trim stripe and a knurled hand wheel;
//   - a blue thread spool on top, with thread running down to the needle;
//   - a small piece of blue cloth under the needle, and a soft shadow underneath.
// Owned by Rubaiya.

/** The drawing is made on a 126 x 100 canvas. */
export const LOGO_ART_WIDTH = 126;
export const LOGO_ART_HEIGHT = 100;

const n = (value: number) => Number(value.toFixed(2));

/** A small repeatable "random" number maker, so the speckles never change. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

/** Very fine speckles, so the painted metal is not perfectly smooth. */
function speckles(count: number) {
  const random = seeded(11);
  let out = '';
  for (let i = 0; i < count; i++) {
    const light = random() > 0.5;
    out += `<circle cx="${n(8 + random() * 112)}" cy="${n(14 + random() * 78)}" r="${n(0.12 + random() * 0.2)}" fill="${light ? '#FFFFFF' : '#000000'}" opacity="${n(0.05 + random() * 0.07)}"/>`;
  }
  return out;
}

/** A small slotted screw head. */
function screw(cx: number, cy: number, r: number) {
  const dx = r * 0.62;
  const dy = r * 0.2;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#lgChrome)" stroke="#5F6872" stroke-width=".35"/><path d="M${n(cx - dx)} ${n(cy + dy)} L${n(cx + dx)} ${n(cy - dy)}" stroke="#3E454D" stroke-width="${n(r * 0.42)}" stroke-linecap="round"/>`;
}

/** Short marks all around a circle (the knurled edge or the numbers of a dial). */
function ticks(
  cx: number,
  cy: number,
  r1: number,
  r2: number,
  count: number,
  color: string,
  width: number,
) {
  let path = '';
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    path += `M${n(cx + c * r1)} ${n(cy + s * r1)} L${n(cx + c * r2)} ${n(cy + s * r2)} `;
  }
  return `<path d="${path}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" fill="none"/>`;
}

/** A chrome dial: a knurled edge, a face with number marks, and a centre cap. */
function dial(cx: number, cy: number, r: number) {
  const shine = `M${n(cx - r * 0.85)} ${n(cy - r * 0.3)} A${n(r * 0.9)} ${n(r * 0.9)} 0 0 1 ${n(cx - r * 0.1)} ${n(cy - r * 0.88)}`;
  return [
    `<circle cx="${cx}" cy="${n(cy + r * 0.12)}" r="${n(r * 1.04)}" fill="#120A06" opacity=".35"/>`,
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#lgChrome)" stroke="#5F6872" stroke-width=".5"/>`,
    ticks(cx, cy, r * 0.84, r * 0.97, 28, '#6C7680', 0.45),
    `<circle cx="${cx}" cy="${cy}" r="${n(r * 0.7)}" fill="url(#lgSteelV)" stroke="#8B95A0" stroke-width=".4"/>`,
    ticks(cx, cy, r * 0.5, r * 0.64, 12, '#3E454D', 0.5),
    `<circle cx="${cx}" cy="${cy}" r="${n(r * 0.3)}" fill="url(#lgChrome)" stroke="#5F6872" stroke-width=".4"/>`,
    `<path d="M${n(cx - r * 0.18)} ${n(cy + r * 0.05)} L${n(cx + r * 0.18)} ${n(cy - r * 0.05)}" stroke="#3E454D" stroke-width=".5" stroke-linecap="round"/>`,
    `<path d="${shine}" stroke="#FFFFFF" stroke-opacity=".75" stroke-width=".8" fill="none" stroke-linecap="round"/>`,
  ].join('');
}

/** The outline of the machine body: curved arm, rounded head, throat and flared base. */
const SILHOUETTE =
  'M5 89 Q5 93 10 93 L120 93 Q124 93 124 89 L124 83 Q124 78 119 78 L116 78 Q110 78 110 72 C110 62 108 54 109 40 Q110 22 98 20 C80 15 52 15 30 19 Q15 22 14 36 L14 47 Q14 56 24 58 Q33 59 37 52 Q40 47 48 47 L74 47 Q83 47 83 57 L83 68 Q83 77 72 77 L11 77 Q5 77 5 83 Z';

const DEFS = `
<clipPath id="lgClip"><path d="${SILHOUETTE}"/></clipPath>
<linearGradient id="lgBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A77B63"/><stop offset=".32" stop-color="#6B4636"/><stop offset="1" stop-color="#34201A"/></linearGradient>
<linearGradient id="lgSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8A5E49"/><stop offset=".45" stop-color="#6B4636"/><stop offset="1" stop-color="#3A2419"/></linearGradient>
<linearGradient id="lgDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A2F24"/><stop offset="1" stop-color="#2A1812"/></linearGradient>
<linearGradient id="lgSteel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6E7883"/><stop offset=".18" stop-color="#C9D1D9"/><stop offset=".38" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#AEB7C0"/><stop offset=".78" stop-color="#E8EDF2"/><stop offset="1" stop-color="#7D8791"/></linearGradient>
<linearGradient id="lgSteelV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".3" stop-color="#D5DBE1"/><stop offset=".5" stop-color="#8F99A4"/><stop offset=".62" stop-color="#C9D1D9"/><stop offset="1" stop-color="#7D8791"/></linearGradient>
<linearGradient id="lgGloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".55"/><stop offset=".6" stop-color="#FFFFFF" stop-opacity=".08"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
<radialGradient id="lgGround" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#1F120B" stop-opacity=".42"/><stop offset=".7" stop-color="#1F120B" stop-opacity=".16"/><stop offset="1" stop-color="#1F120B" stop-opacity="0"/></radialGradient>
<radialGradient id="lgChrome" cx=".34" cy=".28" r=".95"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".35" stop-color="#D5DBE1"/><stop offset=".7" stop-color="#8E98A3"/><stop offset="1" stop-color="#CBD2D9"/></radialGradient>
<linearGradient id="lgBlue" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#44709F"/><stop offset=".3" stop-color="#B2D2F2"/><stop offset=".6" stop-color="#7FAEE0"/><stop offset="1" stop-color="#44709F"/></linearGradient>
<linearGradient id="lgWood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B58E5C"/><stop offset=".35" stop-color="#EFD9B0"/><stop offset=".65" stop-color="#DDBF8D"/><stop offset="1" stop-color="#9C7547"/></linearGradient>
<linearGradient id="lgCloth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CC2E8"/><stop offset="1" stop-color="#5E8FC4"/></linearGradient>
<linearGradient id="lgShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000000" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity=".4"/></linearGradient>
<radialGradient id="lgWheel" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#8A5E49"/><stop offset=".6" stop-color="#4A2F24"/><stop offset="1" stop-color="#241410"/></radialGradient>`;

const BODY = `
<ellipse cx="63" cy="95.6" rx="62" ry="5.4" fill="url(#lgGround)"/>
<ellipse cx="64" cy="94.6" rx="52" ry="2.2" fill="#120A06" opacity=".3"/>

<path d="${SILHOUETTE}" fill="url(#lgBody)"/>
<path d="M90 12 H114 V78 H90 Z" fill="url(#lgShade)" clip-path="url(#lgClip)"/>
<g clip-path="url(#lgClip)">
<path d="M16 24 C42 16.4 82 16.4 108 24.5 L108 33 C82 26 42 26 16 34 Z" fill="url(#lgGloss)"/>
${speckles(70)}
<path d="M14 47 Q14 56 24 58 Q33 59 37 52" stroke="#000000" stroke-opacity=".3" stroke-width="2.6" fill="none"/>
<path d="M107.6 42 C107 54 109 62 109 72" stroke="#BFE0FF" stroke-opacity=".2" stroke-width=".8" fill="none" stroke-linecap="round"/>
<path d="M99 21.4 Q108 23 108.4 36" stroke="#BFE0FF" stroke-opacity=".18" stroke-width=".8" fill="none" stroke-linecap="round"/>
<rect x="45" y="26" width="40" height="12.4" rx="4.4" fill="#000000" fill-opacity=".07" stroke="#000000" stroke-opacity=".34" stroke-width=".55"/>
<path d="M46.2 37.7 H83.8 Q84.6 37.7 84.6 36.9" stroke="#FFFFFF" stroke-opacity=".28" stroke-width=".5" fill="none"/>
</g>
<path d="M30 22.4 C52 18.6 80 18.6 97 22.6" stroke="#FFFFFF" stroke-opacity=".3" stroke-width="2" stroke-linecap="round" fill="none"/>
<ellipse cx="65" cy="32.2" rx="8.6" ry="3" fill="url(#lgSteelV)" stroke="#5F6872" stroke-width=".4"/>
<path d="M58.6 32.2 H71.4" stroke="#4A525B" stroke-width=".5" stroke-linecap="round"/>
<path d="M60.5 31 H69.5" stroke="#FFFFFF" stroke-opacity=".7" stroke-width=".45" stroke-linecap="round"/>
<path d="M48 44.4 L74 44.4 Q85.4 44.4 85.6 57" stroke="#000000" stroke-opacity=".2" stroke-width="2.6" stroke-linecap="round" fill="none" clip-path="url(#lgClip)"/>
<path d="M12 80.4 H108" stroke="#FFFFFF" stroke-opacity=".22" stroke-width="1.6" stroke-linecap="round"/>
<path d="M9 90.6 H119" stroke="#000000" stroke-opacity=".18" stroke-width="3" stroke-linecap="round"/>
<path d="M88 58 V73" stroke="#FFFFFF" stroke-opacity=".24" stroke-width="2.6" stroke-linecap="round"/>
<rect x="86" y="86" width="30" height="1.1" rx=".55" fill="url(#lgSteelV)" opacity=".9"/>
<rect x="49" y="40.6" width="30" height="1.3" rx=".65" fill="url(#lgSteelV)"/>

<rect x="9" y="73.8" width="55" height="3.8" rx="1.6" fill="url(#lgSteelV)" stroke="#6C7680" stroke-width=".3"/>
<path d="M12 73.8 Q22 71 34 72.4 Q46 71.2 58 73.8 Z" fill="url(#lgCloth)"/>
<path d="M14 73 Q24 70.8 34 72" stroke="#FFFFFF" stroke-opacity=".4" stroke-width=".7" fill="none"/>
<path d="M15 72.6 Q34 70.2 55.6 72.8" stroke="#E6F0FB" stroke-opacity=".85" stroke-width=".6" stroke-dasharray="2.2 1.6" fill="none" stroke-linecap="round"/>
<path d="M19 73.9 H37" stroke="#4A525B" stroke-width="1" stroke-dasharray=".7 1.1" fill="none"/>
<rect x="42" y="74.1" width="16" height="3" rx=".8" fill="#E4E9EE" stroke="#6C7680" stroke-width=".3"/>
<path d="M43.6 75.6 H56.4" stroke="#9AA4AE" stroke-width=".35"/>
${screw(11.4, 75.7, 0.9)}${screw(61.4, 75.7, 0.9)}

<ellipse cx="26" cy="40" rx="9.9" ry="10.6" fill="url(#lgDark)"/>
<path d="M18 33 Q26 29.4 34 33" stroke="#FFFFFF" stroke-opacity=".16" stroke-width="1.4" fill="none" stroke-linecap="round"/>
${screw(20, 32.8, 1.05)}${screw(32, 32.8, 1.05)}${screw(20, 47.2, 1.05)}${screw(32, 47.2, 1.05)}
${dial(26, 40, 5.7)}

${dial(96, 57, 5.2)}
<rect x="91.6" y="66.4" width="8.8" height="2.7" rx="1.35" fill="url(#lgSteelV)" stroke="#6C7680" stroke-width=".3"/>

<rect x="25" y="56.4" width="5.6" height="10" rx="1" fill="url(#lgSteel)" stroke="#6C7680" stroke-width=".4"/>
<rect x="24.2" y="54" width="7.2" height="3.6" rx="1" fill="url(#lgSteelV)" stroke="#6C7680" stroke-width=".35"/>
${screw(33.2, 55.8, 1)}
<path d="M21.8 66 H34 L32.8 71.2 H23 Z" fill="url(#lgSteel)" stroke="#6C7680" stroke-width=".5"/>
<rect x="26.6" y="63.8" width="2.4" height="2.6" fill="url(#lgSteelV)" stroke="#6C7680" stroke-width=".3"/>
<path d="M23 69.6 H32.8" stroke="#6C7680" stroke-width=".4" stroke-dasharray="1.2 .8"/>
<path d="M27.8 66.6 V75.4" stroke="#E8EDF2" stroke-width="1.4" stroke-linecap="round"/>

<circle cx="114.6" cy="29" r="10.8" fill="#120A06" opacity=".3"/>
<circle cx="114" cy="28.6" r="10.6" fill="#1B100B"/>
<circle cx="114" cy="28" r="10.5" fill="url(#lgWheel)"/>
${ticks(114, 28, 9.2, 10.4, 40, '#A3745C', 0.45)}
<circle cx="114" cy="28" r="7.4" fill="none" stroke="#A3745C" stroke-width="1.1"/>
<path d="M114 21 V35 M107 28 H121 M109.2 23.2 L118.8 32.8 M118.8 23.2 L109.2 32.8" stroke="#7B5441" stroke-width=".9" opacity=".8"/>
<path d="M113.4 21 V35 M106.6 27.4 H121.4" stroke="#FFFFFF" stroke-opacity=".12" stroke-width=".5"/>
<circle cx="114" cy="28" r="3.6" fill="url(#lgChrome)" stroke="#5F6872" stroke-width=".5"/>
<path d="M112.4 28.7 L115.6 27.3" stroke="#3E454D" stroke-width=".7" stroke-linecap="round"/>
<path d="M106.4 22.6 A9 9 0 0 1 114 19" stroke="#FFFFFF" stroke-opacity=".4" stroke-width="1.2" fill="none" stroke-linecap="round"/>

<rect x="58" y=".6" width="3.4" height="5.2" rx="1.2" fill="url(#lgSteel)"/>
<rect x="49.5" y="3.8" width="20" height="3.6" rx="1.4" fill="url(#lgWood)"/>
<rect x="51.5" y="7.4" width="16" height="6" fill="url(#lgBlue)"/>
<path d="M51.5 9.4 H67.5 M51.5 11.4 H67.5" stroke="#2F527A" stroke-opacity=".35" stroke-width=".6"/>
<rect x="49.5" y="13" width="20" height="3.2" rx="1.4" fill="url(#lgWood)"/>

<path d="M52 10.6 C42 6 34 18 32 29 C31 38 30 46 27.8 56" fill="none" stroke="#44709F" stroke-width="1.7" stroke-linecap="round" opacity=".55" transform="translate(.5 .8)"/>
<path d="M52 10.6 C42 6 34 18 32 29 C31 38 30 46 27.8 56" fill="none" stroke="#7FAEE0" stroke-width="1.5" stroke-linecap="round"/>
<path d="M52 10.6 C42 6 34 18 32 29 C31 38 30 46 27.8 56" fill="none" stroke="#FFFFFF" stroke-opacity=".4" stroke-width=".5" stroke-linecap="round" transform="translate(-.3 -.4)"/>
<path d="M52 10.6 C42 6 34 18 32 29 C31 38 30 46 27.8 56" fill="none" stroke="#2F527A" stroke-opacity=".22" stroke-width=".45" stroke-dasharray="1 1.6" stroke-linecap="round"/>
<circle cx="32" cy="29" r="1.6" fill="url(#lgChrome)" stroke="#5F6872" stroke-width=".3"/>`;

/** The whole logo as SVG text. */
export function logoArtSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${LOGO_ART_WIDTH}" height="${LOGO_ART_HEIGHT}" viewBox="0 0 ${LOGO_ART_WIDTH} ${LOGO_ART_HEIGHT}"><defs>${DEFS}</defs>${BODY}</svg>`;
}
