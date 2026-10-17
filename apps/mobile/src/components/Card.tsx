// apps/mobile/src/components/Card.tsx
//
// A card: a light box that holds ONE idea (one report, one form, one message).
// It has a thin border, a soft shadow and a dashed "stitch line" just inside the
// edge, which gives the app its cloth look (design system sections 7 and 8).
// Owned by Rubaiya.

import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { COLORS as C, SIZES } from '../theme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      <View pointerEvents="none" style={styles.stitch} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderColor: C.cardBorder,
    borderWidth: 1,
    borderRadius: SIZES.cardRadius,
    padding: SIZES.cardPadding,
    shadowColor: C.bar,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  stitch: {
    position: 'absolute',
    top: 7,
    left: 7,
    right: 7,
    bottom: 7,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.cardStitch,
    borderRadius: SIZES.cardRadius - 5,
  },
});
