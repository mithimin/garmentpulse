// apps/mobile/src/components/PictureCard.tsx
//
// A rounded picture card (scissors, steam press or tape measure, cut from the
// website's picture). It is only decoration, so it is hidden from screen readers.
// An optional line of words sits on a cream strip along the bottom, which is
// handy for an empty list ("You have no reports yet.").
// Owned by Rubaiya.

import { Image, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { COLORS as C, SIZES } from '../theme';

type Props = {
  picture: ImageSourcePropType;
  /** Optional words shown on a cream strip at the bottom. */
  caption?: string;
  /** Height of the picture. */
  height?: number;
};

export function PictureCard({ picture, caption, height = 150 }: Props) {
  return (
    <View style={styles.wrap}>
      <Image
        source={picture}
        style={{ width: '100%', height }}
        resizeMode="cover"
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
      {caption ? (
        <View style={styles.strip}>
          <Text style={styles.caption}>{caption}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: SIZES.cardRadius,
    overflow: 'hidden',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  strip: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.card },
  caption: { color: C.softText, fontSize: 15, lineHeight: 22 },
});
