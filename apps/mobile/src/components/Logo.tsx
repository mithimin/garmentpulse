// apps/mobile/src/components/Logo.tsx
//
// The GarmentPulse logo, drawn as a small picture (SVG) so it stays sharp at any
// size. It is a sewing machine (the thing GarmentPulse looks after) with a
// heartbeat ("pulse") line running along its arm.
//   - gold square: the same gold as the design system's logo tile
//   - dashed frame: the "stitch line" that gives the app its cloth look
//   - dark blue machine: arm, pillar, base, thread spool, presser foot and needle
//   - gold zig-zag on the arm: the pulse (the machine is alive and healthy)
//   - gold dashes on the base: the line of stitches the machine sews
// Owned by Rubaiya.

import Svg, { Path, Rect } from 'react-native-svg';

const GOLD = '#DCC593';
const NAVY = '#1F2B47';

export function Logo({ size = 72 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel="GarmentPulse logo">
      <Rect width="64" height="64" rx="16" fill={GOLD} />
      {/* Stitch frame */}
      <Rect
        x="4"
        y="4"
        width="56"
        height="56"
        rx="12"
        fill="none"
        stroke={NAVY}
        strokeWidth="1.5"
        strokeDasharray="3 3"
        opacity="0.55"
      />
      {/* Thread spool on top of the arm */}
      <Rect x="30" y="10" width="8" height="6" rx="1.5" fill={NAVY} />
      {/* Arm (reaches left) and pillar (stands on the right) */}
      <Rect x="12" y="15" width="38" height="11" rx="4" fill={NAVY} />
      <Rect x="40" y="15" width="10" height="33" rx="3" fill={NAVY} />
      {/* Base */}
      <Rect x="9" y="44" width="46" height="8" rx="3" fill={NAVY} />
      {/* Needle bar, presser foot and needle */}
      <Rect x="15" y="26" width="3.5" height="10" fill={NAVY} />
      <Rect x="13.5" y="36" width="6.5" height="3.5" rx="1" fill={NAVY} />
      <Path d="M16.75 39.5 V44" stroke={NAVY} strokeWidth="1.4" strokeLinecap="round" />
      {/* Heartbeat along the arm */}
      <Path
        d="M20 20.5 H25 L27.5 16.8 L31 24.2 L33.5 20.5 H38"
        fill="none"
        stroke={GOLD}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Stitches on the base */}
      <Path
        d="M14 48 H50"
        stroke={GOLD}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="3 3"
      />
    </Svg>
  );
}
