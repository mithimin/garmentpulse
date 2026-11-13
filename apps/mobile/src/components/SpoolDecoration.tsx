// apps/mobile/src/components/SpoolDecoration.tsx
//
// The real-looking blue thread spool with a needle and a loose thread, shown in
// the bottom-left corner of the login screen, lying on the cloth. It is a picture
// (`assets/theme/spool.png`) cut out of Rubaiya's login mock-up with a clear
// background, with a soft dark shadow drawn under its base so it looks like it
// really sits on the cloth. It is only decoration, so it is hidden from screen
// readers.
// Owned by Rubaiya.

import { Image, View } from 'react-native';
import { PICTURES } from '../theme';

/** Height divided by width of the spool picture (373 / 480). */
const SPOOL_SHAPE = 373 / 480;

export function SpoolDecoration({ width }: { width: number }) {
  const height = width * SPOOL_SHAPE;
  return (
    <View
      style={{ width, height }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* soft shadow on the cloth, under the spool's base */}
      <View
        style={{
          position: 'absolute',
          left: width * 0.02,
          top: height * 0.82,
          width: width * 0.62,
          height: height * 0.14,
          borderRadius: width,
          backgroundColor: 'rgba(26,14,8,0.38)',
        }}
      />
      <Image source={PICTURES.spool} style={{ width, height }} resizeMode="contain" />
    </View>
  );
}
