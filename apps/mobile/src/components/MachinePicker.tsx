// apps/mobile/src/components/MachinePicker.tsx
//
// A simple dropdown for choosing a machine (the PRD asks for a simple dropdown).
// It looks like an input box. Pressing it opens a list of machines in a small
// pop-up; pressing a machine closes the list and shows the choice in the box.
// Each row in the list is at least 48 px tall so it is easy to tap.
// Owned by Rubaiya.

import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import type { Machine } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';
import { WORKER_TEXT } from '../language/screenText';
import { COLORS as C, SHARED_COLORS as S, SIZES } from '../theme';

type Props = {
  machines: readonly Machine[];
  /** The id of the chosen machine, or null if nothing is chosen yet. */
  value: string | null;
  onChange: (machineId: string) => void;
  /** Show the box in the "something is wrong" look. */
  hasError?: boolean;
  disabled?: boolean;
};

export function MachinePicker({ machines, value, onChange, hasError, disabled }: Props) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const chosen = machines.find((machine) => machine.id === value);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={WORKER_TEXT.machineLabel[language]}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[styles.box, hasError && styles.boxError]}
      >
        <Text style={chosen ? styles.value : styles.hint} numberOfLines={1}>
          {chosen ? chosen.name : WORKER_TEXT.machineHint[language]}
        </Text>
        <ChevronDown color={C.softText} size={20} strokeWidth={1.8} />
      </Pressable>

      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        {/* Pressing the dark area outside the list closes it. */}
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{WORKER_TEXT.machineLabel[language]}</Text>
            <FlatList
              data={machines}
              keyExtractor={(machine) => machine.id}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="menuitem"
                  onPress={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                  style={styles.row}
                >
                  <Text style={[styles.rowText, item.id === value && styles.rowTextChosen]}>
                    {item.name}
                  </Text>
                  {item.id === value && <Check color={C.mainButton} size={20} strokeWidth={2} />}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  box: {
    height: SIZES.inputHeight,
    backgroundColor: S.white,
    borderColor: S.inputBorder,
    borderWidth: 1,
    borderRadius: SIZES.inputRadius,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  boxError: { borderColor: S.errorText, borderWidth: 2 },
  value: { flex: 1, fontSize: 15, fontWeight: '500', color: C.text },
  hint: { flex: 1, fontSize: 15, color: S.inputHint },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30,36,48,0.55)',
    justifyContent: 'center',
    padding: SIZES.screenPadding,
  },
  sheet: {
    backgroundColor: C.card,
    borderRadius: SIZES.cardRadius,
    padding: 8,
    maxHeight: '70%',
  },
  sheetTitle: {
    color: C.softText,
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  row: {
    minHeight: SIZES.buttonHeight,
    paddingHorizontal: 12,
    borderRadius: SIZES.inputRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowText: { fontSize: 16, color: C.text },
  rowTextChosen: { fontWeight: '700' },
});
