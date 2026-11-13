// apps/mobile/src/components/Button.tsx
//
// The two kinds of buttons in the app, both 48 px tall with fully round ends:
//   - "main":   the one most important action on a screen. Chocolate brown.
//   - "second": any other action. Cream with a thin warm border.
// A button that cannot be used yet looks faded and does nothing when pressed.
// Owned by Rubaiya.

import { Pressable, StyleSheet, Text } from 'react-native';
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
      style={({ pressed }) => [
        styles.base,
        isMain ? styles.main : styles.second,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
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
    paddingHorizontal: 20,
  },
  main: { backgroundColor: C.mainButton, borderColor: C.mainButtonBorder },
  second: { backgroundColor: C.card, borderColor: S.inputBorder },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  text: { fontSize: 16, fontWeight: '600' },
  mainText: { color: C.mainButtonText },
  secondText: { color: C.text },
});
