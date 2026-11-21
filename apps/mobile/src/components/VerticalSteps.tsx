// apps/mobile/src/components/VerticalSteps.tsx
//
// A list of steps from top to bottom, joined by a line. It is used by the worker's
// repair tracker and by the technician's job page, so both look the same.
//   - a finished step is a brown circle with a tick;
//   - the step that is happening now (or is next) is a sky-blue ring;
//   - later steps are empty circles.
// The screen decides which steps there are and what state each one is in.
// Owned by Rubaiya.

import { StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { COLORS as C, MAP_COLORS } from '../theme';

export type StepState = 'done' | 'current' | 'todo';

export type VerticalStep = {
  title: string;
  /** A small grey line under the title (a time, a name ...). Empty = none. */
  detail?: string;
  state: StepState;
};

export function VerticalSteps({ steps }: { steps: readonly VerticalStep[] }) {
  return (
    <View style={styles.steps}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <View key={step.title} style={styles.step}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  step.state === 'done' && styles.dotDone,
                  step.state === 'current' && styles.dotCurrent,
                ]}
              >
                {step.state === 'done' && <Check color="#FFFFFF" size={14} strokeWidth={3} />}
              </View>
              {!isLast && <View style={[styles.line, step.state === 'done' && styles.lineDone]} />}
            </View>
            <View style={styles.stepText}>
              <Text style={[styles.stepTitle, step.state === 'todo' && styles.stepTitleTodo]}>
                {step.title}
              </Text>
              {step.detail ? <Text style={styles.stepDetail}>{step.detail}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const DOT = 24;

const styles = StyleSheet.create({
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
