// apps/mobile/src/components/StepTracker.tsx
//
// The 3-step tracker of a report: Waiting -> In progress -> Resolved
// (design system section 9.9).
//   - finished step: filled dot with a tick
//   - current step:  white dot with a thick ring, and its word in bold
//   - future step:   white dot with a dashed edge
// The words come from the shared word list.
// Owned by Rubaiya.

import { StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { REPORT_STATUSES, STATUS_LABELS } from '@garmentpulse/shared';
import type { ReportStatus } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';
import { COLORS as C, SHARED_COLORS as S } from '../theme';

export function StepTracker({ status }: { status: ReportStatus }) {
  const { language } = useLanguage();
  const current = REPORT_STATUSES.indexOf(status);

  return (
    <View style={styles.row}>
      {REPORT_STATUSES.map((step, index) => {
        const done = index < current || (index === current && status === 'resolved');
        const isCurrent = index === current && !done;
        return (
          <View key={step} style={styles.step}>
            <View style={styles.dotRow}>
              <View style={[styles.line, index === 0 && styles.lineHidden]} />
              <View style={[styles.dot, done && styles.dotDone, isCurrent && styles.dotCurrent]}>
                {done && <Check color={S.white} size={14} strokeWidth={2.4} />}
              </View>
              <View
                style={[styles.line, index === REPORT_STATUSES.length - 1 && styles.lineHidden]}
              />
            </View>
            <Text style={[styles.label, (isCurrent || done) && styles.labelStrong]}>
              {STATUS_LABELS[step][language]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  step: { flex: 1, alignItems: 'center' },
  dotRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  line: { flex: 1, height: 0, borderTopWidth: 2, borderColor: C.bar },
  lineHidden: { borderColor: 'transparent' },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: S.white,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: C.cardStitch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: C.bar, borderStyle: 'solid', borderColor: C.bar },
  dotCurrent: { borderStyle: 'solid', borderWidth: 4, borderColor: C.bar },
  label: { marginTop: 8, fontSize: 13, color: C.softText, textAlign: 'center' },
  labelStrong: { color: C.text, fontWeight: '700' },
});
