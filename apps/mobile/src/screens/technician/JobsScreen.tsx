// apps/mobile/src/screens/technician/JobsScreen.tsx
//
// The technician's Jobs tab. At the top, a small card says whether the technician
// is Free or Busy (busy = at least one assigned job that is not finished; the
// word comes from the shared word list). Under it, the open jobs assigned to this
// technician, newest first. Pressing a job opens its page. A "Log out" button
// sits at the bottom.
// Owned by Rubaiya.

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AVAILABILITY_LABELS } from '@garmentpulse/shared';
import type { Profile } from '@garmentpulse/shared';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { JobCard } from '../../components/JobCard';
import { useReports } from '../../data/ReportsContext';
import { useLanguage } from '../../language/LanguageContext';
import { TECH_TEXT } from '../../language/screenText';
import { COLORS as C, STATUS_COLORS, SIZES } from '../../theme';
import { personName } from '../../language/localNames';

type Props = {
  profile: Profile;
  onOpenJob: (reportId: string) => void;
  onLogout: () => void;
};

export function JobsScreen({ profile, onOpenJob, onLogout }: Props) {
  const { language } = useLanguage();
  const { listMyJobs } = useReports();
  const jobs = listMyJobs(profile, false);
  const availability = jobs.length > 0 ? 'busy' : 'free';
  // Free uses the "resolved" green and Busy the "in progress" blue (design system 4.3).
  const colors = availability === 'free' ? STATUS_COLORS.resolved : STATUS_COLORS.in_progress;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.name}>{personName(profile, language)}</Text>
        <View style={styles.row}>
          <Text style={styles.youAre}>{TECH_TEXT.youAre[language]}</Text>
          <View style={[styles.pill, { backgroundColor: colors.background }]}>
            <Text style={[styles.pillText, { color: colors.text }]}>
              {AVAILABILITY_LABELS[availability][language]}
            </Text>
          </View>
        </View>
        <Text style={styles.hint}>
          {availability === 'free' ? TECH_TEXT.freeHint[language] : TECH_TEXT.busyHint[language]}
        </Text>
      </Card>

      {jobs.length === 0 ? (
        <Text style={styles.empty}>{TECH_TEXT.noJobs[language]}</Text>
      ) : (
        jobs.map((job) => <JobCard key={job.id} job={job} onPress={() => onOpenJob(job.id)} />)
      )}

      <View style={styles.logout}>
        <Button kind="second" label={TECH_TEXT.logoutButton[language]} onPress={onLogout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: SIZES.screenPadding, gap: 18 },
  name: { color: C.text, fontSize: 20, fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  youAre: { color: C.softText, fontSize: 15 },
  pill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  pillText: { fontSize: 13, fontWeight: '700' },
  hint: { color: C.softText, fontSize: 15, lineHeight: 24, marginTop: 8 },
  empty: { color: C.softText, fontSize: 15 },
  logout: { marginTop: 8 },
});
