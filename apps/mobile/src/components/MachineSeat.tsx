// apps/mobile/src/components/MachineSeat.tsx
//
// One machine on the machine map: a rounded "seat" with a small sewing machine and
// its short name (like "C4"). Its colour shows its state:
//   cream = OK, dark brown with a glowing halo = down, butter yellow = waiting,
//   sky blue = in progress.
// A colour is never alone: the screen reader also hears the word, and the name
// is always written on the seat.
// The halo of a machine that is down slowly pulses, so it catches the eye.
// Owned by Rubaiya.

import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import type { MapMachine } from '../data/fakeMachineMap';
import { useLanguage } from '../language/LanguageContext';
import { MAP_COLORS } from '../theme';
import { MachineIcon } from './MachineIcon';
import { mapStatusWord } from './mapStatus';

type Props = {
  machine: MapMachine;
  selected: boolean;
  onPress: () => void;
};

export function MachineSeat({ machine, selected, onPress }: Props) {
  const { language } = useLanguage();
  const colors = MAP_COLORS[machine.status];
  const isDown = machine.status === 'down';
  const pulse = useRef(new Animated.Value(0.2)).current;

  // the halo of a machine that is down pulses slowly
  useEffect(() => {
    if (!isDown) {
      pulse.setValue(0.2);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.85,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.2,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isDown, pulse]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${machine.code}, ${mapStatusWord(machine.status, language)}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.slot}
    >
      {isDown && <Animated.View pointerEvents="none" style={[styles.halo, { opacity: pulse }]} />}
      <View
        style={[
          styles.seat,
          { backgroundColor: colors.background, borderColor: colors.border },
          selected && styles.selected,
        ]}
      >
        <MachineIcon color={colors.icon} size={22} />
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {machine.row}
          {machine.place}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1, aspectRatio: 0.92 },
  halo: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 18,
    backgroundColor: MAP_COLORS.glow,
  },
  seat: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  selected: { borderColor: '#2A1810', borderWidth: 2.5 },
  name: { fontSize: 11, fontWeight: '700' },
});
