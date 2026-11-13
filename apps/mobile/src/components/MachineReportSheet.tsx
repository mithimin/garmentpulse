// apps/mobile/src/components/MachineReportSheet.tsx
//
// The small card that slides up from the bottom when a worker taps a machine on
// the map. It tells where the machine is (floor, row, machine name).
//   - If the machine is OK, the card shows four big picture chips for the common
//     problems (needle broke, thread keeps breaking, strange noise or smell,
//     machine will not start), an optional box for more words, and a
//     "Send report" button. The worker may pick a chip, type words, or both. The
//     report text is the chip's words plus the typed words, at most 500 letters
//     (the limit of `create_report` in the API contract).
//   - If the machine is already down, waiting or in progress, the card only says
//     what is happening, with a "Close" button, so one machine is not reported twice.
// Tapping the dark area outside the card, or the Android back button, closes it.
// Owned by Rubaiya.

import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { MapMachine, MapStatus } from '../data/fakeMachineMap';
import { useLanguage } from '../language/LanguageContext';
import { localizeDigits } from '../language/format';
import { MAP_TEXT } from '../language/screenText';
import { COLORS as C, MAP_COLORS, SHARED_COLORS as S, SIZES } from '../theme';
import { Button } from './Button';
import { MachineIcon } from './MachineIcon';
import { ProblemIcon } from './ProblemIcon';
import type { ProblemKind } from './ProblemIcon';
import { mapStatusWord } from './mapStatus';

type Props = {
  /** The machine that was tapped; null = the card is closed. */
  machine: MapMachine | null;
  onClose: () => void;
  /** Called with the report text when the worker presses "Send report". */
  onSend: (machine: MapMachine, description: string) => void;
};

const MAX_LETTERS = 500;

/** The common problems, in the order they are shown (two by two). */
const PROBLEMS: readonly { kind: ProblemKind; words: keyof typeof MAP_TEXT }[] = [
  { kind: 'needle', words: 'problemNeedle' },
  { kind: 'thread', words: 'problemThread' },
  { kind: 'noise', words: 'problemNoise' },
  { kind: 'start', words: 'problemStart' },
];

function infoFor(status: MapStatus) {
  if (status === 'down') return MAP_TEXT.infoDown;
  if (status === 'waiting') return MAP_TEXT.infoWaiting;
  return MAP_TEXT.infoInProgress;
}

export function MachineReportSheet({ machine, onClose, onSend }: Props) {
  const { language } = useLanguage();
  const [problem, setProblem] = useState<ProblemKind | null>(null);
  const [description, setDescription] = useState('');
  const [showError, setShowError] = useState(false);

  // every time a different machine is opened, start with nothing chosen
  useEffect(() => {
    setProblem(null);
    setDescription('');
    setShowError(false);
  }, [machine?.id]);

  function handleSend() {
    if (!machine) return;
    const typed = description.trim();
    if (!problem && typed.length === 0) {
      setShowError(true);
      return;
    }
    const chosenWords = problem
      ? MAP_TEXT[PROBLEMS.find((item) => item.kind === problem)!.words][language]
      : '';
    const text = [chosenWords, typed].filter((part) => part.length > 0).join('. ');
    onSend(machine, text.slice(0, MAX_LETTERS));
  }

  const colors = machine ? MAP_COLORS[machine.status] : MAP_COLORS.ok;
  const where = machine
    ? `${MAP_TEXT.floor[language]} ${localizeDigits(String(machine.floor), language)} · ${MAP_TEXT.row[language]} ${machine.row} · ${MAP_TEXT.machine[language]} ${machine.row}${localizeDigits(String(machine.place), language)}`
    : '';

  return (
    <Modal visible={machine !== null} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable
          style={styles.outside}
          onPress={onClose}
          accessibilityLabel={MAP_TEXT.close[language]}
        />
        {machine && (
          <View style={styles.sheet}>
            <View style={styles.grabber} />
            <View style={styles.header}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
              >
                <MachineIcon color={colors.icon} size={26} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title} accessibilityRole="header">
                  {machine.status === 'ok' ? MAP_TEXT.sheetTitle[language] : machine.code}
                </Text>
                <Text style={styles.where}>{where}</Text>
              </View>
              <View
                style={[
                  styles.chip,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.chipText, { color: colors.text }]}>
                  {mapStatusWord(machine.status, language)}
                </Text>
              </View>
            </View>

            {machine.status === 'ok' ? (
              <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
                <Text style={styles.label}>{MAP_TEXT.descriptionLabel[language]}</Text>
                <View style={styles.problems} accessibilityRole="radiogroup">
                  {PROBLEMS.map((item) => {
                    const chosen = item.kind === problem;
                    return (
                      <Pressable
                        key={item.kind}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: chosen }}
                        onPress={() => {
                          setProblem(chosen ? null : item.kind);
                          setShowError(false);
                        }}
                        style={[styles.problem, chosen && styles.problemChosen]}
                      >
                        <ProblemIcon
                          kind={item.kind}
                          color={chosen ? C.mainButtonText : C.mainButton}
                          size={30}
                        />
                        <Text style={[styles.problemText, chosen && styles.problemTextChosen]}>
                          {MAP_TEXT[item.words][language]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={[styles.label, styles.moreLabel]}>{MAP_TEXT.moreLabel[language]}</Text>
                <TextInput
                  style={[styles.input, showError && styles.inputError]}
                  value={description}
                  onChangeText={(text) => {
                    setDescription(text);
                    setShowError(false);
                  }}
                  placeholder={MAP_TEXT.descriptionHint[language]}
                  placeholderTextColor={S.inputHint}
                  multiline
                  maxLength={MAX_LETTERS}
                  textAlignVertical="top"
                  accessibilityLabel={MAP_TEXT.moreLabel[language]}
                />
                {showError && (
                  <Text style={styles.error} accessibilityRole="alert">
                    {MAP_TEXT.emptyError[language]}
                  </Text>
                )}
                <View style={styles.buttons}>
                  <Button label={MAP_TEXT.send[language]} onPress={handleSend} />
                  <Button kind="second" label={MAP_TEXT.cancel[language]} onPress={onClose} />
                </View>
              </ScrollView>
            ) : (
              <>
                <Text style={styles.info}>{infoFor(machine.status)[language]}</Text>
                {machine.description ? (
                  <Text style={styles.said}>{`"${machine.description}"`}</Text>
                ) : null}
                <View style={styles.buttons}>
                  <Button kind="second" label={MAP_TEXT.close[language]} onPress={onClose} />
                </View>
              </>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(42,24,16,0.5)', justifyContent: 'flex-end' },
  outside: { flex: 1, minHeight: 60 },
  sheet: {
    maxHeight: '88%',
    backgroundColor: C.card,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: SIZES.screenPadding + 4,
    paddingTop: 10,
    paddingBottom: 26,
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.cardBorder,
    marginBottom: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title: { color: C.text, fontSize: 19, fontWeight: '700' },
  where: { color: C.softText, fontSize: 14, marginTop: 2 },
  chip: { borderWidth: 1, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 },
  chipText: { fontSize: 13, fontWeight: '700' },
  label: { color: C.text, fontSize: 15, fontWeight: '700', marginBottom: 8 },
  moreLabel: { marginTop: 14, fontSize: 13, fontWeight: '600', color: C.softText },
  problems: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  problem: {
    width: '48%',
    flexGrow: 1,
    minHeight: 84,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: MAP_COLORS.ok.border,
    backgroundColor: MAP_COLORS.ok.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  problemChosen: { backgroundColor: C.mainButton, borderColor: C.mainButtonBorder },
  problemText: { color: C.text, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  problemTextChosen: { color: C.mainButtonText },
  input: {
    minHeight: 64,
    backgroundColor: S.inputBackground,
    borderColor: S.inputBorder,
    borderWidth: 1,
    borderRadius: SIZES.inputRadius,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text,
  },
  inputError: { borderColor: S.errorText },
  error: { color: S.errorText, fontSize: 14, marginTop: 6 },
  buttons: { gap: 10, marginTop: 16 },
  info: { color: C.text, fontSize: 16, lineHeight: 24 },
  said: { color: C.softText, fontSize: 15, lineHeight: 22, marginTop: 10, fontStyle: 'italic' },
});
