// apps/mobile/src/components/ProblemIcon.tsx
//
// Small pictures (drawn from simple lines) for the common machine problems, so a
// worker can choose a problem by its picture and not only by reading:
//   needle = a needle that has snapped, thread = a spool with a snapped thread,
//   noise = a sound wave, start = a power sign.
// They take one colour and one size.
// Owned by Rubaiya.

import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type ProblemKind = 'needle' | 'thread' | 'noise' | 'start';

export function ProblemIcon({
  kind,
  color,
  size = 30,
}: {
  kind: ProblemKind;
  color: string;
  size?: number;
}) {
  const common = {
    stroke: color,
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      {kind === 'needle' && (
        <>
          {/* a needle in two pieces, with little sparks where it snapped */}
          <Path d="M3.5 20.5 L10 14" {...common} />
          <Path d="M13 11 L18.2 5.8" {...common} />
          <Circle cx={19.4} cy={4.6} r={1.5} {...common} />
          <Path d="M10.6 10.4 L9.4 9.2 M13.6 15.2 L14.8 16.4 M11.2 12.6 L8.6 12.6" {...common} />
        </>
      )}
      {kind === 'thread' && (
        <>
          {/* a spool, with a thread that ends in a snap */}
          <Rect x={3.5} y={3.5} width={10} height={3} rx={1} {...common} />
          <Rect x={3.5} y={17.5} width={10} height={3} rx={1} {...common} />
          <Path d="M5.5 6.5 V17.5 M11.5 6.5 V17.5 M5.5 10 H11.5 M5.5 14 H11.5" {...common} />
          <Path d="M13.5 12 C17 12 18 9 17.5 7" {...common} />
          <Path d="M20 5 L21.5 3.5 M17.5 3.5 L16.5 2.2" {...common} />
        </>
      )}
      {kind === 'noise' && (
        <Path d="M2.5 12 H5.5 L8 5 L11 19 L14 3.5 L16.5 15 L18 12 H21.5" {...common} />
      )}
      {kind === 'start' && (
        <>
          <Path d="M12 3 V11" {...common} />
          <Path d="M7.2 6.6 A7.5 7.5 0 1 0 16.8 6.6" {...common} />
        </>
      )}
    </Svg>
  );
}
