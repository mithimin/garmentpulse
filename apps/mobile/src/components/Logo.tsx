// apps/mobile/src/components/Logo.tsx
//
// The GarmentPulse logo, drawn as a small picture (SVG) so it stays sharp at any
// size. The idea: a line of stitches that turns into a heartbeat ("pulse") and
// ends in the eye of a sewing needle. Sewing + pulse = GarmentPulse.
//   - gold square: the same gold as the design system's logo tile
//   - dashed frame: the "stitch line" that gives the app its cloth look
//   - dashed start of the line: the thread being sewn
//   - the zig-zag: the heartbeat
//   - the ring at the end: the eye of the needle
// Owned by Rubaiya.

import Svg, { Circle, Path, Rect } from 'react-native-svg';

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
      {/* Thread being sewn (dashed) */}
      <Path
        d="M9 36 H21"
        stroke={NAVY}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="4 4"
      />
      {/* Heartbeat */}
      <Path
        d="M21 36 L26 36 L31 20 L37 48 L42 36 L47 36"
        fill="none"
        stroke={NAVY}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Eye of the needle */}
      <Circle cx="53" cy="36" r="4.5" fill="none" stroke={NAVY} strokeWidth="3" />
    </Svg>
  );
}
