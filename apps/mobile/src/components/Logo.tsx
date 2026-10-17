// apps/mobile/src/components/Logo.tsx
//
// The GarmentPulse logo, drawn as a small picture (SVG) so it stays sharp at any
// size. It is a T-shirt (the garment) with a heartbeat ("pulse") line across the
// chest, sewn with a dashed hem stitch.
//   - gold square: the same gold as the design system's logo tile
//   - dashed frame: the "stitch line" that gives the app its cloth look
//   - dark blue T-shirt: the garment
//   - gold zig-zag on the chest: the pulse
//   - gold dashes along the bottom: the hem stitching
// Owned by Rubaiya.

import Svg, { G, Path, Rect } from 'react-native-svg';

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
      {/* T-shirt, drawn on a 64 grid and shrunk a little to sit inside the frame */}
      <G transform="translate(8 8) scale(0.75)">
        <Path
          d="M22 12 L12 17 L5 29 L14 34 L18 29 L18 52 L46 52 L46 29 L50 34 L59 29 L52 17 L42 12 Q32 20 22 12 Z"
          fill={NAVY}
          stroke={NAVY}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Hem stitching */}
        <Path
          d="M21 47 H43"
          stroke={GOLD}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="3 3"
        />
        {/* Heartbeat on the chest */}
        <Path
          d="M21 35 L27 35 L30 27 L34 42 L37 35 L43 35"
          fill="none"
          stroke={GOLD}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}
