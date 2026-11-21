// apps/mobile/src/components/FabricBackground.tsx
//
// A very faint woven-cloth pattern behind the whole page (fine crossing threads, a
// little like linen). It is drawn as SVG text, so it is sharp on every phone, and it
// is so light that text on top stays easy to read. The cards sit on top of it with
// their own solid colour. It never reacts to touches.
// Owned by Rubaiya.

import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

const WEAVE = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><pattern id="weave" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 0.5 H6 M0 3.5 H6" stroke="#5B3C2E" stroke-opacity=".04" stroke-width=".7"/><path d="M0.5 0 V6 M3.5 0 V6" stroke="#5B3C2E" stroke-opacity=".03" stroke-width=".7"/></pattern></defs><rect width="100%" height="100%" fill="url(#weave)"/></svg>`;

export function FabricBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <SvgXml xml={WEAVE} width="100%" height="100%" />
    </View>
  );
}
