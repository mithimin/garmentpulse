// apps/mobile/src/components/RepairTracker.tsx
//
// The live repair tracker on the worker's Home screen: a card for the worker's
// latest report that is not finished yet, with four steps from top to bottom:
//   1. Reported            (always done, shows when)
//   2. Technician assigned (done when a technician is set, shows the name)
//   3. Fixing now          (done when the status is "in progress")
//   4. Done                (done when the report is resolved)
// A step that is finished is a brown circle with a tick; the step that is
// happening now is a sky-blue ring; the next steps are empty circles. It uses the
// worker's REAL reports, so it moves by itself when the technician accepts the job
// and starts work (the screen already gets live updates).
// Tapping the card opens the full report.
// Owned by Rubaiya.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import type { Report } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';
import { formatDateTime } from '../language/format';
import { machineName, personName } from '../language/localNames';
import { TRACK_TEXT } from '../language/screenText';
import { COLORS as C, MAP_COLORS } from '../theme';
import { Card } from './Card';
import { StatusLabel } from './StatusLabel';

type Props = {
  report: Report;
  onPress: () => void;
};

type StepState = 'done' | 'current' | 'todo';

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

  const steps: { title: string; detail: string }[] = [
    { title: TRACK_TEXT.reported[language], detail: formatDateTime(report.created_at, language) },
    {
      title: TRACK_TEXT.assigned[language],
      detail: technicianName ?? TRACK_TEXT.waitingTech[language],
    },
    {
      title: TRACK_TEXT.fixing[language],
      detail:
        finished >= 3 && technicianName
          ? `${technicianName} ${TRACK_TEXT.isWorking[language]}`
          : TRACK_TEXT.notStarted[language],
    },
    {
      title: TRACK_TEXT.done[language],
      detail: finished >= 4 ? TRACK_TEXT.doneDetail[language] : '',
    },
  ];

  function stateOf(index: number): StepState {
    if (index < finished) return 'done';
    return index === finished ? 'current' : 'todo';
  }

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
          <StatusLabel status={report.status} />
        </View>

        <View style={styles.steps}>
          {steps.map((step, index) => {
            const state = stateOf(index);
            const isLast = index === steps.length - 1;
            return (
              <View key={step.title} style={styles.step}>
                <View style={styles.rail}>
                  <View
                    style={[
                      styles.dot,
                      state === 'done' && styles.dotDone,
                      state === 'current' && styles.dotCurrent,
                    ]}
                  >
                    {state === 'done' && <Check color="#FFFFFF" size={14} strokeWidth={3} />}
                  </View>
                  {!isLast && <View style={[styles.line, state === 'done' && styles.lineDone]} />}
                </View>
                <View style={styles.stepText}>
                  <Text style={[styles.stepTitle, state === 'todo' && styles.stepTitleTodo]}>
                    {step.title}
                  </Text>
                  {step.detail ? <Text style={styles.stepDetail}>{step.detail}</Text> : null}
                </View>
              </View>
            );
          })}
        </View>
      </Card>
    </Pressable>
  );
}

const DOT = 24;

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  headerText: { flex: 1 },
  kicker: { color: C.softText, fontSize: 13, fontWeight: '700' },
  machine: { color: C.text, fontSize: 19, fontWeight: '700', marginTop: 2 },
  steps: { marginLeft: 2 },
  step: { flexDirection: 'row', gap: 14, minHeight: 52 },
  rail: { alignItems: 'center', width: DOT },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 2,
    borderColor: C.cardBorder,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: C.mainButton, borderColor: C.mainButton },
  dotCurrent: {
    borderColor: MAP_COLORS.in_progress.border,
    backgroundColor: MAP_COLORS.in_progress.background,
    borderWidth: 4,
  },
  line: { flex: 1, width: 2, backgroundColor: C.cardBorder, marginVertical: 2 },
  lineDone: { backgroundColor: C.mainButton },
  stepText: { flex: 1, paddingBottom: 12 },
  stepTitle: { color: C.text, fontSize: 16, fontWeight: '700' },
  stepTitleTodo: { color: C.softText, fontWeight: '500' },
  stepDetail: { color: C.softText, fontSize: 14, marginTop: 1 },
});
