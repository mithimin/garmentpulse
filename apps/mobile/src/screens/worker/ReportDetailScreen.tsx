// apps/mobile/src/screens/worker/ReportDetailScreen.tsx
//
// The details of ONE report, opened from "My reports" or from Home. Shows the
// machine, the status label, what the worker wrote, when it was reported, which
// technician is on it (or a note that it is still in the queue), and the 3-step
// tracker: Waiting -> In progress -> Resolved.
// Owned by Rubaiya.

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Report } from '@garmentpulse/shared';
import { Card } from '../../components/Card';
import { StatusLabel } from '../../components/StatusLabel';
import { StepTracker } from '../../components/StepTracker';
import { useLanguage } from '../../language/LanguageContext';
import { formatDateTime } from '../../language/format';
import { WORKER_TEXT } from '../../language/screenText';
import { COLORS as C, SIZES } from '../../theme';
import { machineName, personName } from '../../language/localNames';

export function ReportDetailScreen({ report }: { report: Report }) {
  const { language } = useLanguage();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.machine}>{machineName(report.machine, language)}</Text>
        <StatusLabel status={report.status} />

        <Text style={styles.label}>{WORKER_TEXT.problemLabel[language]}</Text>
        <Text style={styles.value}>{report.description}</Text>

        <Text style={styles.label}>{WORKER_TEXT.reportedAtLabel[language]}</Text>
        <Text style={styles.value}>{formatDateTime(report.created_at, language)}</Text>

        <Text style={styles.label}>{WORKER_TEXT.technicianLabel[language]}</Text>
        <Text style={styles.value}>
          {report.technician
            ? personName(report.technician, language)
            : WORKER_TEXT.noTechnicianYet[language]}
        </Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>{WORKER_TEXT.progressLabel[language]}</Text>
        <View style={styles.tracker}>
          <StepTracker status={report.status} />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: SIZES.screenPadding, gap: 18 },
  machine: { color: C.text, fontSize: 20, fontWeight: '600', marginBottom: 8 },
  label: { color: C.softText, fontSize: 13, fontWeight: '600', marginTop: 16 },
  value: { color: C.text, fontSize: 15, lineHeight: 24, marginTop: 2 },
  cardTitle: { color: C.text, fontSize: 18, fontWeight: '600' },
  tracker: { marginTop: 16 },
});
