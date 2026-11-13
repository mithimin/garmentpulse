// apps/mobile/src/components/MachineIcon.tsx
//
// A small sewing-machine picture (drawn from simple shapes) for the seats on the
// machine map. It takes one colour, so it can be dark on a cream seat and cream
// on a dark brown seat.
// Owned by Rubaiya.

import Svg, { Path, Rect } from 'react-native-svg';

export function MachineIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      {/* the thread spool on top */}
      <Rect x={9.2} y={2.2} width={5} height={3.2} rx={0.8} fill={color} />
      {/* the arm, the head, the pillar and the base */}
      <Path
        d="M3 7.2 Q3 5.6 4.8 5.6 H18.4 Q21 5.6 21 8.2 V17 H18 V10.2 H8.4 Q7.6 10.2 7.6 11 V13 H3 Z"
        fill={color}
      />
      <Rect x={2} y={17} width={20} height={3.6} rx={1.4} fill={color} />
      {/* the needle */}
      <Rect x={4.2} y={13} width={1.2} height={4} fill={color} />
    </Svg>
  );
}
