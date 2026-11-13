// apps/mobile/src/screens/worker/WorkerHomeScreen.tsx
//
// The worker's Home tab. The machine map is the main part:
//   1. a plain hello with the worker's name (no picture, so the map gets the room);
//   2. the live repair tracker, only while the worker has a report that is not
//      finished yet (it uses the worker's REAL reports and moves by itself);
//   3. the machine map (floors, rows and machines; tap a machine to report it);
//   4. when nothing is open, the worker's latest report, then a "Log out" button.
// The long "Report a problem" form is still in the Report tab.
// Owned by Rubaiya.

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Profile } from '@garmentpulse/shared';
import { Button } from '../../components/Button';
import { MachineMap } from '../../components/MachineMap';
import { Greeting } from '../../components/Greeting';
import { RepairTracker } from '../../components/RepairTracker';
import { ReportCard } from '../../components/ReportCard';
import { useReports } from '../../data/ReportsContext';
import { useLanguage } from '../../language/LanguageContext';
import { WORKER_TEXT } from '../../language/screenText';
import { COLORS as C, SIZES } from '../../theme';
import { personName } from '../../language/localNames';

type Props = {
  profile: Profile;
  onOpenReport: (reportId: string) => void;
  onLogout: () => void;
};

export function WorkerHomeScreen({ profile, onOpenReport, onLogout }: Props) {
  const { language } = useLanguage();
  const { listMyReports } = useReports();
  const reports = listMyReports(profile);
  // the newest report that is not finished yet (newest first), if there is one
  const open = reports.find((report) => report.status !== 'resolved');
  const latest = reports[0];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Greeting greeting={WORKER_TEXT.homeHello[language]} name={personName(profile, language)} />

      {open && <RepairTracker report={open} onPress={() => onOpenReport(open.id)} />}

      <MachineMap />

      {!open && (
        <>
          <Text style={styles.sectionTitle}>{WORKER_TEXT.homeLatestTitle[language]}</Text>
          {latest ? (
            <ReportCard report={latest} onPress={() => onOpenReport(latest.id)} />
          ) : (
            <Text style={styles.empty}>{WORKER_TEXT.homeNoReports[language]}</Text>
          )}
        </>
      )}

      <View style={styles.logout}>
        <Button kind="second" label={WORKER_TEXT.logoutButton[language]} onPress={onLogout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: SIZES.screenPadding, gap: 18 },
  sectionTitle: { color: C.text, fontSize: 18, fontWeight: '600' },
  empty: { color: C.softText, fontSize: 15 },
  logout: { marginTop: 8 },
});
