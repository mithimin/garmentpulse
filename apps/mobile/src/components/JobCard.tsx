// apps/mobile/src/components/JobCard.tsx
//
// One job shown as a card for the technician: the machine, WHERE it stands (floor,
// row, seat, so the technician can walk straight to it), the status label, the
// worker's description, who reported it, and when. A job that has not been
// accepted yet shows a small "New: please accept" note, so it is easy to spot.
// A finished job also shows how long the repair took (from "accepted" to "fixed").
// Pressing the card opens the job page.
// Owned by Rubaiya.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Report } from '@garmentpulse/shared';
import { Card } from './Card';
import { DownTimer } from './DownTimer';
import { StatusLabel } from './StatusLabel';
import { useLanguage } from '../language/LanguageContext';
import { formatDateTime } from '../language/format';
import { machinePlace } from '../language/machinePlace';
import { TECH_TEXT } from '../language/screenText';
import { COLORS as C } from '../theme';
import { machineName, personName } from '../language/localNames';
import { repairTime } from '../language/repairTime';

type Props = {
  job: Report;
  onPress: () => void;
  /** True for the job that waited longest: it gets a "Next" mark. */
  isNext?: boolean;
};

export function JobCard({ job, onPress, isNext = false }: Props) {
  const { language } = useLanguage();
  const needsAccept = job.accepted_at === null && job.status !== 'resolved';
  const place = machinePlace(job.machine, language);
  const took = repairTime(job, language);

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Card>
        <View style={styles.top}>
          <Text style={styles.machine} numberOfLines={1}>
            {machineName(job.machine, language)}
          </Text>
          {place ? <Text style={styles.place}>{place}</Text> : null}
          <View style={styles.labels}>
            {isNext && (
              <View style={styles.nextMark}>
                <Text style={styles.nextText}>{TECH_TEXT.nextJob[language]}</Text>
              </View>
            )}
            <StatusLabel status={job.status} />
            {needsAccept && <Text style={styles.newNote}>{TECH_TEXT.needsAccept[language]}</Text>}
          </View>
          {job.status !== 'resolved' && <DownTimer since={job.created_at} />}
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {job.description}
        </Text>
        <Text style={styles.meta}>
          {personName(job.reported_by, language)} · {formatDateTime(job.created_at, language)}
        </Text>
        {took ? (
          <Text style={styles.took}>
            {TECH_TEXT.repairTook[language]} {took}
          </Text>
        ) : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: { gap: 8, marginBottom: 8 },
  labels: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  machine: { color: C.text, fontSize: 18, fontWeight: '600' },
  place: { color: C.mainButton, fontSize: 16, fontWeight: '700' },
  nextMark: {
    backgroundColor: C.mainButton,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  nextText: { color: C.mainButtonText, fontSize: 13, fontWeight: '700' },
  newNote: { color: C.mainButton, fontSize: 13, fontWeight: '700' },
  description: { color: C.text, fontSize: 15, lineHeight: 24 },
  meta: { color: C.softText, fontSize: 13, marginTop: 8 },
  took: { color: C.text, fontSize: 14, fontWeight: '700', marginTop: 6 },
});
