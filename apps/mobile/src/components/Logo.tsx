// apps/mobile/src/components/Logo.tsx
//
// The GarmentPulse logo: a realistic sewing machine (shaded brown body, chrome
// dials and screws, a steel needle, a blue thread spool on top, a hand wheel and
// a piece of blue cloth). The drawing itself is built as SVG text in
// `logoArtSvg.ts` (the same text is used to make the app icon files). It is made
// of shapes, so it stays sharp at any size.
// `Logo` takes the WIDTH you want; the height follows the drawing's shape.
// `LogoTile` puts it on a rounded cream tile, as in the website's top bar.
// Owned by Rubaiya.

import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { LOGO_ART_HEIGHT, LOGO_ART_WIDTH, logoArtSvg } from './logoArtSvg';

/** The drawing is built once, not every time a screen redraws. */
const LOGO_ART = logoArtSvg();

export function Logo({ size = 72 }: { size?: number }) {
  return (
    <SvgXml
      xml={LOGO_ART}
      width={size}
      height={(size * LOGO_ART_HEIGHT) / LOGO_ART_WIDTH}
      accessibilityLabel="GarmentPulse logo"
    />
  );
}

/** The logo on a rounded cream tile, as in the website's top bar. */
export function LogoTile({ size = 44 }: { size?: number }) {
  return (
    <View style={[styles.tile, { width: size, height: size, borderRadius: size * 0.28 }]}>
      <Logo size={size * 0.84} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { backgroundColor: '#FFFBEF', alignItems: 'center', justifyContent: 'center' },
});
