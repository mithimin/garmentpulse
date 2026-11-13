// apps/mobile/src/components/Greeting.tsx
//
// A plain hello at the top of a screen: a small greeting word and the person's name
// in big letters, on the cream page, with no picture behind it. It is used on the
// worker's Home so the machine map gets the room.
// Owned by Rubaiya.

import { StyleSheet, Text, View } from 'react-native';
import { COLORS as C } from '../theme';

type Props = {
  /** A short wish, like "Hello". */
  greeting: string;
  /** The person's name (in the chosen language). */
  name: string;
};

export function Greeting({ greeting, name }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 4, paddingTop: 2 },
  greeting: { color: C.softText, fontSize: 16 },
  name: { color: C.text, fontSize: 28, fontWeight: '700', marginTop: 1 },
});
