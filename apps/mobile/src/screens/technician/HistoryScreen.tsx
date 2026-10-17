// apps/mobile/src/screens/technician/HistoryScreen.tsx
//
// The technician's History tab: the "past jobs", which are the jobs assigned to
// this technician that are already resolved (docs/api-contract.md 4.5,
// `list_my_jobs` with past jobs included). Newest first. Pressing a job opens
// its page.
// Owned by Rubaiya.

import { ScrollView, StyleSheet, Text } from 'react-native';
import type { Profile } from '@garmentpulse/shared';
import { JobCard } from '../../components/JobCard';
import { useReports } from '../../data/ReportsContext';
import { useLanguage } from '../../language/LanguageContext';
import { TECH_TEXT } from '../../language/screenText';
import { COLORS as C, SIZES } from '../../theme';

type Props = {
  profile: Profile;
  onOpenJob: (reportId: string) => void;
};

export function HistoryScreen({ profile, onOpenJob }: Props) {
  const { language } = useLanguage();
  const { listMyJobs } = useReports();
  const pastJobs = listMyJobs(profile, true).filter((job) => job.status === 'resolved');

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {pastJobs.length === 0 ? (
        <Text style={styles.empty}>{TECH_TEXT.noHistory[language]}</Text>
      ) : (
        pastJobs.map((job) => <JobCard key={job.id} job={job} onPress={() => onOpenJob(job.id)} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: SIZES.screenPadding, gap: 18 },
  empty: { color: C.softText, fontSize: 15 },
});
