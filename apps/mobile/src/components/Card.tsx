// apps/mobile/src/components/Card.tsx
//
// A card: a light cream box with big rounded corners that holds ONE idea (one
// report, one form, one message). It has a thin warm border and a soft brown
// shadow, like the cards on the website.
// `tone="dark"` makes it a chocolate-brown feature card (like the "New reports"
// box on the website); `tone="blue"` makes it a sky-blue card.
// Owned by Rubaiya.

import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { COLORS as C, SIZES } from '../theme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'cream' | 'dark' | 'blue';
};

export function Card({ children, style, tone = 'cream' }: Props) {
  return (
    <View
      style={[styles.card, tone === 'dark' && styles.dark, tone === 'blue' && styles.blue, style]}
    >
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
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  dark: { backgroundColor: C.darkCard, borderColor: '#432C20' },
  blue: { backgroundColor: C.blue, borderColor: C.blueTag },
});
