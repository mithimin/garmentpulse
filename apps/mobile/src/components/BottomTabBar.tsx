// apps/mobile/src/components/BottomTabBar.tsx
//
// The bar at the bottom of the phone with 2 to 4 tabs. Each tab is an icon with a
// word under it, at least 56 px tall. The chosen tab is white on a soft pill.
// Same blue as the top bar, with a dashed stitch line along its top edge
// (design system section 9.6). Used by the worker screens now and by the
// technician screens later.
// Owned by Rubaiya.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ComponentType } from 'react';
import { COLORS as C } from '../theme';

type IconComponent = ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;

export type TabItem<Key extends string> = {
  key: Key;
  label: string;
  Icon: IconComponent;
};

type Props<Key extends string> = {
  tabs: readonly TabItem<Key>[];
  active: Key;
  onChange: (key: Key) => void;
};

export function BottomTabBar<Key extends string>({ tabs, active, onChange }: Props<Key>) {
  return (
    <View style={styles.bar}>
      <View pointerEvents="none" style={styles.stitch} />
      {tabs.map(({ key, label, Icon }) => {
        const chosen = key === active;
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: chosen }}
            onPress={() => onChange(key)}
            style={styles.tab}
          >
            <View style={[styles.pill, chosen && styles.pillChosen]}>
              <Icon color={chosen ? C.barTextChosen : C.barText} size={22} strokeWidth={1.8} />
              <Text style={[styles.label, chosen && styles.labelChosen]} numberOfLines={1}>
                {label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: C.bar,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 16,
  },
  stitch: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 3,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.barStitch,
  },
  tab: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
  pill: {
    minHeight: 52,
    minWidth: 80,
    paddingHorizontal: 12,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  pillChosen: { backgroundColor: C.tabPill },
  label: { color: C.barText, fontSize: 12, fontWeight: '600' },
  labelChosen: { color: C.barTextChosen },
});
