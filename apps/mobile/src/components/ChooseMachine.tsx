// apps/mobile/src/components/ChooseMachine.tsx
//
// "Choose your machine": a short list shown to a worker the first time (and after
// "Change my machine"). Each row is one machine with its name, code and place. Tapping a
// row tells the Home screen which machine is theirs; the phone remembers it.
// This exists because the backend does not yet say which machine belongs to which worker.
// Owned by Rubaiya.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Machine } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';
import { machineName } from '../language/localNames';
import { machinePlace } from '../language/machinePlace';
import { MY_MACHINE_TEXT } from '../language/screenText';
import { COLORS as C, SIZES } from '../theme';

type Props = {
  machines: Machine[];
  onChoose: (machineId: string) => void;
};

export function ChooseMachine({ machines, onChoose }: Props) {
  const { language } = useLanguage();
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{MY_MACHINE_TEXT.chooseTitle[language]}</Text>
      <Text style={styles.help}>{MY_MACHINE_TEXT.chooseHelp[language]}</Text>
      {machines.map((machine) => (
        <Pressable
          key={machine.id}
          accessibilityRole="button"
          onPress={() => onChoose(machine.id)}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <Text style={styles.name}>
            {machineName(machine, language)}
            {machine.code ? `  ·  ${machine.code}` : ''}
          </Text>
          <Text style={styles.place}>{machinePlace(machine, language)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  title: { color: C.text, fontSize: 20, fontWeight: '700' },
  help: { color: C.softText, fontSize: 15 },
  row: {
    minHeight: 56,
    backgroundColor: C.card,
    borderColor: C.cardBorder,
    borderWidth: 1,
    borderRadius: SIZES.inputRadius,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  name: { color: C.text, fontSize: 16, fontWeight: '600' },
  place: { color: C.softText, fontSize: 13, marginTop: 2 },
});
