// apps/mobile/src/screens/technician/JobsScreen.tsx
//
// The technician's Jobs tab. A plain hello with the name (no picture), then a big
// coloured banner that says whether the
// technician is Free (green) or Busy (blue). Busy = at least one assigned job that
// is not finished; the word comes from the shared word list. When busy, the banner
// also names the machine the technician is on and WHERE it stands, and pressing it
// opens that job. Under the banner, the open jobs assigned to this technician,
// OLDEST first (the job that waited longest is on top, marked "Next"). Pressing a job opens its page. A "Log out" button sits at the bottom.
// Pull the screen down to update it. Cards appear gently, one after another.
// Owned by Rubaiya.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AVAILABILITY_LABELS } from '@garmentpulse/shared';
import type { Profile } from '@garmentpulse/shared';
import { Button } from '../../components/Button';
import { JobCard } from '../../components/JobCard';
import { FadeIn } from '../../components/FadeIn';
import { Greeting } from '../../components/Greeting';
import { RefreshableScroll } from '../../components/RefreshableScroll';
import { useReports } from '../../data/ReportsContext';
import { useLanguage } from '../../language/LanguageContext';
import { machinePlace } from '../../language/machinePlace';
import { TECH_TEXT } from '../../language/screenText';
import { COLORS as C, STATUS_COLORS, SIZES } from '../../theme';
import { machineName, personName } from '../../language/localNames';

type Props = {
  profile: Profile;
  onOpenJob: (reportId: string) => void;
  onLogout: () => void;
};

export function JobsScreen({ profile, onOpenJob, onLogout }: Props) {
  const { language } = useLanguage();
  const { listMyJobs } = useReports();
  // the job that has waited LONGEST comes first (and gets the "Next" mark)
  const jobs = [...listMyJobs(profile, false)].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  );
  const availability = jobs.length > 0 ? 'busy' : 'free';
  // Free uses the "resolved" green and Busy the "in progress" blue (design system 4.3).
  const colors = availability === 'free' ? STATUS_COLORS.resolved : STATUS_COLORS.in_progress;
  // the job the technician is on: the one already accepted, else the newest
  const current = jobs.find((job) => job.accepted_at !== null) ?? jobs[0];

  return (
    <RefreshableScroll>
      <Greeting greeting={TECH_TEXT.hello[language]} name={personName(profile, language)} />

      <View style={[styles.banner, { backgroundColor: colors.background }]}>
        <Text style={[styles.youAre, { color: colors.text }]}>{TECH_TEXT.youAre[language]}</Text>
        <Text style={[styles.state, { color: colors.text }]}>
          {AVAILABILITY_LABELS[availability][language]}
        </Text>
        {current ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => onOpenJob(current.id)}
            style={styles.currentJob}
          >
            <Text style={[styles.currentLabel, { color: colors.text }]}>
              {TECH_TEXT.currentJob[language]}
            </Text>
            <Text style={[styles.currentMachine, { color: colors.text }]} numberOfLines={1}>
              {machineName(current.machine, language)}
            </Text>
            <Text style={[styles.currentPlace, { color: colors.text }]}>
              {machinePlace(current.machine, language)}
            </Text>
          </Pressable>
        ) : (
          <Text style={[styles.hint, { color: colors.text }]}>{TECH_TEXT.freeHint[language]}</Text>
        )}
      </View>

      {jobs.length === 0 ? (
        <Text style={styles.empty}>{TECH_TEXT.noJobs[language]}</Text>
      ) : (
        jobs.map((job, index) => (
          <FadeIn key={job.id} delay={index * 60}>
            <JobCard job={job} isNext={index === 0} onPress={() => onOpenJob(job.id)} />
          </FadeIn>
        ))
      )}

      <View style={styles.logout}>
        <Button kind="second" label={TECH_TEXT.logoutButton[language]} onPress={onLogout} />
      </View>
    </RefreshableScroll>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: SIZES.cardRadius, padding: SIZES.cardPadding, gap: 4 },
  youAre: { fontSize: 14, fontWeight: '600' },
  state: { fontSize: 32, fontWeight: '800' },
  hint: { fontSize: 15, lineHeight: 24, marginTop: 6 },
  currentJob: {
    minHeight: SIZES.minTap,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.12)',
  },
  currentLabel: { fontSize: 13, fontWeight: '600' },
  currentMachine: { fontSize: 18, fontWeight: '700', marginTop: 2 },
  currentPlace: { fontSize: 15, fontWeight: '600', marginTop: 2 },
  empty: { color: C.softText, fontSize: 15 },
  logout: { marginTop: 8 },
});
