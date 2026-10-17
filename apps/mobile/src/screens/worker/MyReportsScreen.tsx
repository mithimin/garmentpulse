// apps/mobile/src/screens/worker/MyReportsScreen.tsx
//
// The worker's "My reports" tab: every report this worker made, newest first.
// Each report is a card with the machine, a status label (colour + word) and the
// description. Pressing a card opens its details.
// Owned by Rubaiya.

import { ScrollView, StyleSheet, Text } from 'react-native';
import type { Profile } from '@garmentpulse/shared';
import { ReportCard } from '../../components/ReportCard';
import { useReports } from '../../data/ReportsContext';
import { useLanguage } from '../../language/LanguageContext';
import { WORKER_TEXT } from '../../language/screenText';
import { COLORS as C, SIZES } from '../../theme';

type Props = {
  profile: Profile;
  onOpenReport: (reportId: string) => void;
};

export function MyReportsScreen({ profile, onOpenReport }: Props) {
  const { language } = useLanguage();
  const { listMyReports } = useReports();
  const reports = listMyReports(profile);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {reports.length === 0 ? (
        <Text style={styles.empty}>{WORKER_TEXT.myReportsEmpty[language]}</Text>
      ) : (
        reports.map((report) => (
          <ReportCard key={report.id} report={report} onPress={() => onOpenReport(report.id)} />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: SIZES.screenPadding, gap: 18 },
  empty: { color: C.softText, fontSize: 15 },
});
