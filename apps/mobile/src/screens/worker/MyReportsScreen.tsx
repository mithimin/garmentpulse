// apps/mobile/src/screens/worker/MyReportsScreen.tsx
//
// The worker's "My reports" tab: every report this worker made, newest first.
// Each report is a card with the machine, a status label (colour + word) and the
// description. Pressing a card opens its details.
// Pull the screen down to update it. Cards appear gently, one after another.
// Owned by Rubaiya.

import { StyleSheet, Text } from 'react-native';
import type { Profile } from '@garmentpulse/shared';
import { FadeIn } from '../../components/FadeIn';
import { RefreshableScroll } from '../../components/RefreshableScroll';
import { ReportCard } from '../../components/ReportCard';
import { useReports } from '../../data/ReportsContext';
import { useLanguage } from '../../language/LanguageContext';
import { WORKER_TEXT } from '../../language/screenText';
import { COLORS as C } from '../../theme';

type Props = {
  profile: Profile;
  onOpenReport: (reportId: string) => void;
};

export function MyReportsScreen({ profile, onOpenReport }: Props) {
  const { language } = useLanguage();
  const { listMyReports } = useReports();
  const reports = listMyReports(profile);

  return (
    <RefreshableScroll>
      {reports.length === 0 ? (
        <Text style={styles.empty}>{WORKER_TEXT.myReportsEmpty[language]}</Text>
      ) : (
        reports.map((report, index) => (
          <FadeIn key={report.id} delay={index * 60}>
            <ReportCard report={report} onPress={() => onOpenReport(report.id)} />
          </FadeIn>
        ))
      )}
    </RefreshableScroll>
  );
}

const styles = StyleSheet.create({
  empty: { color: C.softText, fontSize: 15 },
});
