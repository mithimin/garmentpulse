// apps/web/components/Logo.tsx
//
// The GarmentPulse logo for the website, drawn as a small picture (SVG) so it
// stays sharp at any size. It is a sewing machine (the thing GarmentPulse looks
// after) with a heartbeat ("pulse") line running along its arm.
// It is the same drawing as the phone app's logo (made by Rubaiya), copied here
// because the phone version only works inside a phone app.
//   - dark blue machine: arm, pillar, base, thread spool, presser foot and needle
//   - gold zig-zag on the arm: the pulse (the machine is alive and healthy)
//   - gold dashes on the base: the line of stitches the machine sews
// Use `light` when the logo sits on a dark background (for example the top bar).
// Owned by Mithi.

const GOLD = '#DCC593';
const NAVY = '#1F2B47';
const WHITE = '#F7F9FB';

export function Logo({ size = 72, light = false }: { size?: number; light?: boolean }) {
  const body = light ? WHITE : NAVY;
  return (
    <svg
      width={size}
      height={size}
      viewBox="6 5 52 52"
      role="img"
      aria-label="GarmentPulse logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Thread spool on top of the arm */}
      <rect x="30" y="10" width="8" height="6" rx="1.5" fill={body} />
      {/* Arm (reaches left) and pillar (stands on the right) */}
      <rect x="12" y="15" width="38" height="11" rx="4" fill={body} />
      <rect x="40" y="15" width="10" height="33" rx="3" fill={body} />
      {/* Base */}
      <rect x="9" y="44" width="46" height="8" rx="3" fill={body} />
      {/* Needle bar, presser foot and needle */}
      <rect x="15" y="26" width="3.5" height="10" fill={body} />
      <rect x="13.5" y="36" width="6.5" height="3.5" rx="1" fill={body} />
      <path d="M16.75 39.5 V44" stroke={body} strokeWidth="1.4" strokeLinecap="round" />
      {/* Heartbeat along the arm */}
      <path
        d="M20 20.5 H25 L27.5 16.8 L31 24.2 L33.5 20.5 H38"
        fill="none"
        stroke={GOLD}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Stitches on the base */}
      <path
        d="M14 48 H50"
        stroke={GOLD}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="3 3"
      />
    </svg>
  );
}
