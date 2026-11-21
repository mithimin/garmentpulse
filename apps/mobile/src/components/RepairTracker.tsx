// apps/mobile/src/components/RepairTracker.tsx
//
// The live repair tracker on the worker's Home screen: a card for the worker's
// latest report that is not finished yet, with four steps from top to bottom:
//   1. Reported            (always done, shows when)
//   2. Technician assigned (done when a technician is set, shows the name)
//   3. Fixing now          (done when the status is "in progress")
//   4. Done                (done when the report is resolved)
// The steps are drawn by `VerticalSteps.tsx` (the technician's job page uses the
// same drawing). It uses the worker's REAL reports, so it moves by itself when the
// technician accepts the job and starts work (the screen already gets live updates).
// The label at the top-right has the same word and colour as the machine picture.
// Tapping the card opens the full report.
// Owned by Rubaiya.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Report } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';
import { formatDateTime } from '../language/format';
import { machineName, personName } from '../language/localNames';
import { TRACK_TEXT } from '../language/screenText';
import { COLORS as C } from '../theme';
import { Card } from './Card';
import { MY_MACHINE_LOOKS } from './myMachineLooks';
import type { MyMachineLook } from './myMachineLooks';
import { VerticalSteps } from './VerticalSteps';
import type { StepState, VerticalStep } from './VerticalSteps';

type Props = {
  report: Report;
  onPress: () => void;
};

export function RepairTracker({ report, onPress }: Props) {
  const { language } = useLanguage();

  // how many steps are finished: 1 = reported, 2 = + assigned, 3 = + fixing, 4 = all
  const finished =
    report.status === 'resolved'
      ? 4
      : report.status === 'in_progress'
        ? 3
        : report.technician
          ? 2
          : 1;
  const technicianName = report.technician ? personName(report.technician, language) : null;

  // the look of the machine picture that goes with this report
  const look: MyMachineLook =
    report.status === 'resolved'
      ? 'ok'
      : report.status === 'in_progress'
        ? 'fixing'
        : report.technician
          ? 'assigned'
          : 'down';
  const looks = MY_MACHINE_LOOKS[look];

  function stateOf(index: number): StepState {
    if (index < finished) return 'done';
    return index === finished ? 'current' : 'todo';
  }

  const steps: VerticalStep[] = [
    {
      title: TRACK_TEXT.reported[language],
      detail: formatDateTime(report.created_at, language),
      state: stateOf(0),
    },
    // the title tells the truth: "Waiting for a technician" until one is assigned
    {
      title: technicianName ? TRACK_TEXT.assigned[language] : TRACK_TEXT.waitingTech[language],
      detail: technicianName ?? '',
      state: stateOf(1),
    },
    {
      title: TRACK_TEXT.fixing[language],
      detail:
        finished >= 3 && technicianName
          ? `${technicianName} ${TRACK_TEXT.isWorking[language]}`
          : TRACK_TEXT.notStarted[language],
      state: stateOf(2),
    },
    {
      title: TRACK_TEXT.done[language],
      detail: finished >= 4 ? TRACK_TEXT.doneDetail[language] : '',
      state: stateOf(3),
    },
  ];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={TRACK_TEXT.openHint[language]}
      onPress={onPress}
    >
      <Card>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.kicker}>{TRACK_TEXT.title[language]}</Text>
            <Text style={styles.machine} numberOfLines={1}>
              {machineName(report.machine, language)}
            </Text>
          </View>
          {/* the same word and colour as the machine picture above */}
          <View
            style={[
              styles.chip,
              { backgroundColor: looks.chipBackground, borderColor: looks.chipBorder },
            ]}
          >
            <Text style={[styles.chipText, { color: looks.chipText }]}>{looks.word(language)}</Text>
          </View>
        </View>

        <VerticalSteps steps={steps} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  headerText: { flex: 1 },
  kicker: { color: C.softText, fontSize: 13, fontWeight: '700' },
  machine: { color: C.text, fontSize: 19, fontWeight: '700', marginTop: 2 },
  chip: { borderWidth: 1, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 },
  chipText: { fontSize: 13, fontWeight: '700' },
});
