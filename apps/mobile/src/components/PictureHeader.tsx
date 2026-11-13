// apps/mobile/src/components/PictureHeader.tsx
//
// The greeting block at the top of the Home screens: a big greeting and the
// person's name in dark brown, sitting on the soft factory photo (cut from the
// website's picture). The photo fades into the cream page on the left, so the
// words stay easy to read, exactly like the website's dashboard.
// Owned by Rubaiya.

import { Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { COLORS as C, PICTURES, SIZES } from '../theme';

type Props = {
  /** A short wish, like "Have a good day". */
  greeting: string;
  /** The person's name (in the chosen language). */
  name: string;
  /** One small line under the name, like "2 jobs are waiting for you". */
  note?: string;
};

export function PictureHeader({ greeting, name, note }: Props) {
  return (
    <View style={styles.wrap}>
      <Image source={PICTURES.factory} style={styles.photo} resizeMode="cover" />
      {/* Cream fade over the left side of the photo so the words are readable. */}
      <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#F2E4D4" stopOpacity="0.95" />
            <Stop offset="0.5" stopColor="#F2E4D4" stopOpacity="0.85" />
            <Stop offset="1" stopColor="#F2E4D4" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#fade)" />
      </Svg>
      <View style={styles.words}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 190,
    borderRadius: SIZES.cardRadius,
    overflow: 'hidden',
    backgroundColor: C.page,
    justifyContent: 'center',
  },
  // The machine is on the right of the photo, so we show the right part of it.
  photo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  words: { paddingHorizontal: 18, maxWidth: '75%' },
  greeting: { color: C.softText, fontSize: 16 },
  name: { color: C.text, fontSize: 32, fontWeight: '700', marginTop: 2 },
  note: { color: C.softText, fontSize: 14, marginTop: 6 },
});
