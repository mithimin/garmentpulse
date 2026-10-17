// apps/mobile/src/screens/worker/ReportProblemScreen.tsx
//
// The worker's Report tab: the form for telling the factory that a machine is
// broken. The worker picks a machine from a dropdown and types a short
// description (1 to 500 letters), then presses "Send report".
//
//   - If something is missing, a friendly message appears right under that box.
//   - While sending, the button says "Sending…" and cannot be pressed again.
//   - When it works, the form is replaced by a "Report sent" card with two
//     buttons: see my reports, or report another problem.
// The new report is saved in the FAKE reports store (see data/ReportsContext.tsx).
// Owned by Rubaiya.

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { getErrorCode } from '@garmentpulse/shared';
import type { Profile } from '@garmentpulse/shared';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { MachinePicker } from '../../components/MachinePicker';
import { MAX_DESCRIPTION_LENGTH, useReports } from '../../data/ReportsContext';
import { useLanguage } from '../../language/LanguageContext';
import { localizeDigits } from '../../language/format';
import { ERROR_TEXT, WORKER_TEXT } from '../../language/screenText';
import { COLORS as C, SHARED_COLORS as S, SIZES } from '../../theme';

type Props = {
  profile: Profile;
  onSeeMyReports: () => void;
};

export function ReportProblemScreen({ profile, onSeeMyReports }: Props) {
  const { language } = useLanguage();
  const { machines, createReport } = useReports();

  const [machineId, setMachineId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  // We keep "which problem" (not the sentence), so the sentence follows the language.
  const [machineMissing, setMachineMissing] = useState(false);
  const [descriptionProblem, setDescriptionProblem] = useState<'missing' | 'tooLong' | null>(null);
  const [backendError, setBackendError] = useState<ReturnType<typeof getErrorCode> | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (sending) return;
    setBackendError(null);

    // Check the boxes ourselves first, so the message appears right under the box.
    const noMachine = machineId === null;
    const trimmed = description.trim();
    const problem =
      trimmed.length === 0 ? 'missing' : trimmed.length > MAX_DESCRIPTION_LENGTH ? 'tooLong' : null;
    setMachineMissing(noMachine);
    setDescriptionProblem(problem);
    if (noMachine || problem) return;

    setSending(true);
    try {
      await createReport(profile, machineId, trimmed);
      setSent(true);
    } catch (error) {
      setBackendError(getErrorCode(error));
    } finally {
      setSending(false);
    }
  }

  function startAnother() {
    setMachineId(null);
    setDescription('');
    setMachineMissing(false);
    setDescriptionProblem(null);
    setBackendError(null);
    setSent(false);
  }

  if (sent) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.tick}>
            <Check color={S.white} size={28} strokeWidth={2.4} />
          </View>
          <Text style={styles.sentTitle}>{WORKER_TEXT.sentTitle[language]}</Text>
          <Text style={styles.sentBody}>{WORKER_TEXT.sentBody[language]}</Text>
          <View style={styles.buttons}>
            <Button label={WORKER_TEXT.sentViewButton[language]} onPress={onSeeMyReports} />
            <Button
              kind="second"
              label={WORKER_TEXT.sentAnotherButton[language]}
              onPress={startAnother}
            />
          </View>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={styles.label}>{WORKER_TEXT.machineLabel[language]}</Text>
        <MachinePicker
          machines={machines}
          value={machineId}
          onChange={(id) => {
            setMachineId(id);
            setMachineMissing(false);
          }}
          hasError={machineMissing}
          disabled={sending}
        />
        {machineMissing && (
          <Text style={styles.fieldError}>{WORKER_TEXT.machineMissing[language]}</Text>
        )}

        <Text style={[styles.label, styles.labelSpaced]}>
          {WORKER_TEXT.descriptionLabel[language]}
        </Text>
        <TextInput
          style={[styles.textArea, descriptionProblem && styles.textAreaError]}
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            setDescriptionProblem(null);
          }}
          placeholder={WORKER_TEXT.descriptionHint[language]}
          placeholderTextColor={S.inputHint}
          multiline
          textAlignVertical="top"
          editable={!sending}
        />
        <Text style={styles.counter}>
          {localizeDigits(`${description.length}/${MAX_DESCRIPTION_LENGTH}`, language)}
        </Text>
        {descriptionProblem && (
          <Text style={styles.fieldError}>
            {descriptionProblem === 'missing'
              ? WORKER_TEXT.descriptionMissing[language]
              : WORKER_TEXT.descriptionTooLong[language]}
          </Text>
        )}

        {backendError && (
          <View style={styles.errorBox} accessibilityRole="alert">
            <Text style={styles.errorBoxText}>{ERROR_TEXT[backendError][language]}</Text>
          </View>
        )}

        <View style={styles.sendRow}>
          <Button
            label={sending ? WORKER_TEXT.sending[language] : WORKER_TEXT.sendButton[language]}
            onPress={handleSend}
            disabled={sending}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: SIZES.screenPadding },
  label: { color: C.text, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  labelSpaced: { marginTop: 16 },
  textArea: {
    minHeight: 120,
    backgroundColor: S.white,
    borderColor: S.inputBorder,
    borderWidth: 1,
    borderRadius: SIZES.inputRadius,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: C.text,
  },
  textAreaError: { borderColor: S.errorText, borderWidth: 2 },
  counter: { color: C.softText, fontSize: 12, textAlign: 'right', marginTop: 4 },
  fieldError: { color: S.errorText, fontSize: 13, lineHeight: 20, marginTop: 4 },
  errorBox: {
    backgroundColor: S.errorBackground,
    borderColor: S.errorBorder,
    borderWidth: 1,
    borderRadius: SIZES.inputRadius,
    padding: 12,
    marginTop: 12,
  },
  errorBoxText: { color: S.errorText, fontSize: 15, lineHeight: 24 },
  sendRow: { marginTop: 16 },
  tick: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.bar,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sentTitle: { color: C.text, fontSize: 20, fontWeight: '600', textAlign: 'center' },
  sentBody: {
    color: C.softText,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  buttons: { gap: 12 },
});
