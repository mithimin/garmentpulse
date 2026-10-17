// apps/mobile/src/components/JobCard.tsx
//
// One job shown as a card for the technician: the machine, the status label, the
// worker's description, who reported it, and when. A job that has not been
// accepted yet shows a small "New: please accept" note, so it is easy to spot.
// Pressing the card opens the job page.
// Owned by Rubaiya.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Report } from '@garmentpulse/shared';
import { Card } from './Card';
import { StatusLabel } from './StatusLabel';
import { useLanguage } from '../language/LanguageContext';
import { formatDateTime } from '../language/format';
import { TECH_TEXT } from '../language/screenText';
import { COLORS as C } from '../theme';

type Props = {
  job: Report;
  onPress: () => void;
};

export function JobCard({ job, onPress }: Props) {
  const { language } = useLanguage();
  const needsAccept = job.accepted_at === null && job.status !== 'resolved';

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Card>
        <View style={styles.top}>
          <Text style={styles.machine} numberOfLines={1}>
            {job.machine.name}
          </Text>
          <View style={styles.labels}>
            <StatusLabel status={job.status} />
            {needsAccept && <Text style={styles.newNote}>{TECH_TEXT.needsAccept[language]}</Text>}
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {job.description}
        </Text>
        <Text style={styles.meta}>
          {job.reported_by.display_name} · {formatDateTime(job.created_at, language)}
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: { gap: 8, marginBottom: 8 },
  labels: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  machine: { color: C.text, fontSize: 18, fontWeight: '600' },
  newNote: { color: C.mainButton, fontSize: 13, fontWeight: '700' },
  description: { color: C.text, fontSize: 15, lineHeight: 24 },
  meta: { color: C.softText, fontSize: 13, marginTop: 8 },
});
