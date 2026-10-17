// apps/mobile/src/components/Button.tsx
//
// The two kinds of buttons in the app (design system section 9.1), both 48 px tall:
//   - "main":   the one most important action on a screen. Dark blue with a stitch line.
//   - "second": any other action. Near-white with a thin border.
// A button that cannot be used yet looks faded and does nothing when pressed.
// Owned by Rubaiya.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { COLORS as C, SHARED_COLORS as S, SIZES } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  kind?: 'main' | 'second';
  disabled?: boolean;
  /** An optional icon shown before the words. */
  icon?: ReactNode;
};

export function Button({ label, onPress, kind = 'main', disabled = false, icon }: Props) {
  const isMain = kind === 'main';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.base, isMain ? styles.main : styles.second, disabled && styles.disabled]}
    >
      {isMain && <View pointerEvents="none" style={styles.stitch} />}
      {icon}
      <Text style={[styles.text, isMain ? styles.mainText : styles.secondText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: SIZES.buttonHeight,
    borderRadius: SIZES.buttonRadius,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  main: { backgroundColor: C.mainButton, borderColor: C.mainButtonBorder },
  second: { backgroundColor: C.card, borderColor: S.inputBorder },
  disabled: { opacity: 0.5 },
  stitch: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.45)',
    borderRadius: SIZES.buttonRadius - 4,
  },
  text: { fontSize: 16, fontWeight: '600' },
  mainText: { color: C.mainButtonText },
  secondText: { color: C.text },
});
