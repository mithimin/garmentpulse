// apps/mobile/src/screens/worker/WorkerHomeScreen.tsx
//
// The worker's Home tab: a short hello, one big "Report a problem" button (the
// most important action), the worker's latest report, and a "Log out" button.
// Owned by Rubaiya.

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Wrench } from 'lucide-react-native';
import type { Profile } from '@garmentpulse/shared';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ReportCard } from '../../components/ReportCard';
import { useReports } from '../../data/ReportsContext';
import { useLanguage } from '../../language/LanguageContext';
import { WORKER_TEXT } from '../../language/screenText';
import { COLORS as C, SIZES } from '../../theme';

type Props = {
  profile: Profile;
  onReportProblem: () => void;
  onOpenReport: (reportId: string) => void;
  onLogout: () => void;
};

export function WorkerHomeScreen({ profile, onReportProblem, onOpenReport, onLogout }: Props) {
  const { language } = useLanguage();
  const { listMyReports } = useReports();
  const latest = listMyReports(profile)[0];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.hello}>
          {WORKER_TEXT.homeHello[language]}, {profile.display_name}
        </Text>
        <Text style={styles.intro}>{WORKER_TEXT.homeIntro[language]}</Text>
        <Button
          label={WORKER_TEXT.homeReportButton[language]}
          onPress={onReportProblem}
          icon={<Wrench color={C.mainButtonText} size={20} strokeWidth={1.8} />}
        />
      </Card>

      <Text style={styles.sectionTitle}>{WORKER_TEXT.homeLatestTitle[language]}</Text>
      {latest ? (
        <ReportCard report={latest} onPress={() => onOpenReport(latest.id)} />
      ) : (
        <Text style={styles.empty}>{WORKER_TEXT.homeNoReports[language]}</Text>
      )}

      <View style={styles.logout}>
        <Button kind="second" label={WORKER_TEXT.logoutButton[language]} onPress={onLogout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: SIZES.screenPadding, gap: 18 },
  hello: { color: C.text, fontSize: 20, fontWeight: '600', marginBottom: 8 },
  intro: { color: C.softText, fontSize: 15, lineHeight: 24, marginBottom: 16 },
  sectionTitle: { color: C.text, fontSize: 18, fontWeight: '600' },
  empty: { color: C.softText, fontSize: 15 },
  logout: { marginTop: 8 },
});
