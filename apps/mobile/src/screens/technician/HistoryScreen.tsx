// apps/mobile/src/screens/technician/HistoryScreen.tsx
//
// The technician's History tab: the "past jobs", which are the jobs assigned to
// this technician that are already resolved (docs/api-contract.md 4.5,
// `list_my_jobs` with past jobs included). Newest first. Each card also says how
// long the repair took (see JobCard). Pressing a job opens its page.
// Pull the screen down to update it. Cards appear gently, one after another.
// Owned by Rubaiya.

import { StyleSheet, Text } from 'react-native';
import type { Profile } from '@garmentpulse/shared';
import { FadeIn } from '../../components/FadeIn';
import { JobCard } from '../../components/JobCard';
import { RefreshableScroll } from '../../components/RefreshableScroll';
import { useReports } from '../../data/ReportsContext';
import { useLanguage } from '../../language/LanguageContext';
import { TECH_TEXT } from '../../language/screenText';
import { COLORS as C } from '../../theme';

type Props = {
  profile: Profile;
  onOpenJob: (reportId: string) => void;
};

export function HistoryScreen({ profile, onOpenJob }: Props) {
  const { language } = useLanguage();
  const { listMyJobs } = useReports();
  const pastJobs = listMyJobs(profile, true).filter((job) => job.status === 'resolved');

  return (
    <RefreshableScroll>
      {pastJobs.length === 0 ? (
        <Text style={styles.empty}>{TECH_TEXT.noHistory[language]}</Text>
      ) : (
        pastJobs.map((job, index) => (
          <FadeIn key={job.id} delay={index * 60}>
            <JobCard job={job} onPress={() => onOpenJob(job.id)} />
          </FadeIn>
        ))
      )}
    </RefreshableScroll>
  );
}

const styles = StyleSheet.create({
  empty: { color: C.softText, fontSize: 15 },
});
