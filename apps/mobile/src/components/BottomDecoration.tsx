// apps/mobile/src/components/BottomDecoration.tsx
//
// The decoration at the bottom of the login screen, lying on the cloth:
//   - the blue thread spool with a needle, moved in from the corner and tilted a
//     little, as if someone just put it down;
//   - a loose blue thread that loops once and swoops across the cloth to the
//     right (drawn in `threadArtSvg.ts`);
// It is only decoration, so it is hidden from screen readers and ignores touches.
// `width` is the width of the phone screen.
// Owned by Rubaiya.

import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { SpoolDecoration } from './SpoolDecoration';
import { THREAD_ART_HEIGHT, THREAD_ART_WIDTH, threadArtSvg } from './threadArtSvg';

/** The thread drawing is built once, not every time the screen redraws. */
const THREAD_ART = threadArtSvg();

export function BottomDecoration({ width }: { width: number }) {
  const height = (width * THREAD_ART_HEIGHT) / THREAD_ART_WIDTH;
  return (
    <View
      style={{ width, height }}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <SvgXml xml={THREAD_ART} width={width} height={height} />
      {/* the spool sits a little in from the corner, tilted */}
      <View
        style={{
          position: 'absolute',
          left: width * 0.045,
          bottom: -4,
          transform: [{ rotate: '-7deg' }],
        }}
      >
        <SpoolDecoration width={width * 0.21} />
      </View>
    </View>
  );
}
