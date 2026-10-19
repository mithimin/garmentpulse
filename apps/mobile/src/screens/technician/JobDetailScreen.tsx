// apps/mobile/src/screens/technician/JobDetailScreen.tsx
//
// The page of ONE job, where the technician does the work in three small steps:
//   1. "Accept job"     -> the technician takes the job (status stays Waiting)
//   2. "Start work"     -> Waiting becomes In progress
//   3. "Mark as fixed"  -> In progress becomes Resolved (final)
// Only the button for the NEXT step is shown, because a status only moves
// forward (docs/api-contract.md 2.6). The page also shows the machine, what the
// worker wrote, who reported it, the times, and the 3-step tracker.
// If the (fake) backend refuses, a friendly sentence is shown under the buttons.
// Owned by Rubaiya.

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Check, Play, Wrench } from 'lucide-react-native';
import { getErrorCode } from '@garmentpulse/shared';
import type { Profile, Report } from '@garmentpulse/shared';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { StatusLabel } from '../../components/StatusLabel';
import { StepTracker } from '../../components/StepTracker';
import { useReports } from '../../data/ReportsContext';
import { useLanguage } from '../../language/LanguageContext';
import { formatDateTime } from '../../language/format';
import { ERROR_TEXT, TECH_TEXT } from '../../language/screenText';
import { COLORS as C, SHARED_COLORS as S, SIZES } from '../../theme';
import { machineName, personName } from '../../language/localNames';

type Props = {
  profile: Profile;
  job: Report;
};

export function JobDetailScreen({ profile, job }: Props) {
  const { language } = useLanguage();
  const { acceptJob, updateJobStatus } = useReports();
  const [saving, setSaving] = useState(false);
  const [errorCode, setErrorCode] = useState<ReturnType<typeof getErrorCode> | null>(null);

  /** Runs one action, shows "Saving…" while waiting, and shows an error if it fails. */
  async function run(action: () => Promise<unknown>) {
    if (saving) return;
    setErrorCode(null);
    setSaving(true);
    try {
      await action();
    } catch (error) {
      setErrorCode(getErrorCode(error));
    } finally {
      setSaving(false);
    }
  }

  // Which single button is next?
  let nextButton: { label: string; icon: React.ReactNode; onPress: () => void } | null;
  const iconColor = C.mainButtonText;
  if (job.status === 'resolved') {
    nextButton = null;
  } else if (!job.accepted_at) {
    nextButton = {
      label: TECH_TEXT.acceptButton[language],
      icon: <Check color={iconColor} size={20} strokeWidth={1.8} />,
      onPress: () => run(() => acceptJob(profile, job.id)),
    };
  } else if (job.status === 'waiting') {
    nextButton = {
      label: TECH_TEXT.startButton[language],
      icon: <Play color={iconColor} size={20} strokeWidth={1.8} />,
      onPress: () => run(() => updateJobStatus(profile, job.id, 'in_progress')),
    };
  } else {
    nextButton = {
      label: TECH_TEXT.fixedButton[language],
      icon: <Wrench color={iconColor} size={20} strokeWidth={1.8} />,
      onPress: () => run(() => updateJobStatus(profile, job.id, 'resolved')),
    };
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.machine}>{machineName(job.machine, language)}</Text>
        <StatusLabel status={job.status} />

        <Text style={styles.label}>{TECH_TEXT.problemLabel[language]}</Text>
        <Text style={styles.value}>{job.description}</Text>

        <Text style={styles.label}>{TECH_TEXT.reportedByLabel[language]}</Text>
        <Text style={styles.value}>{personName(job.reported_by, language)}</Text>

        <Text style={styles.label}>{TECH_TEXT.reportedAtLabel[language]}</Text>
        <Text style={styles.value}>{formatDateTime(job.created_at, language)}</Text>

        <Text style={styles.label}>{TECH_TEXT.acceptedAtLabel[language]}</Text>
        <Text style={styles.value}>
          {job.accepted_at
            ? formatDateTime(job.accepted_at, language)
            : TECH_TEXT.notAcceptedYet[language]}
        </Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>{TECH_TEXT.progressLabel[language]}</Text>
        <View style={styles.tracker}>
          <StepTracker status={job.status} />
        </View>
      </Card>

      {errorCode && (
        <View style={styles.errorBox} accessibilityRole="alert">
          <Text style={styles.errorText}>{ERROR_TEXT[errorCode][language]}</Text>
        </View>
      )}

      {nextButton ? (
        <Button
          label={saving ? TECH_TEXT.working[language] : nextButton.label}
          icon={saving ? undefined : nextButton.icon}
          onPress={nextButton.onPress}
          disabled={saving}
        />
      ) : (
        <Text style={styles.doneNote}>{TECH_TEXT.doneNote[language]}</Text>
      )}
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
  errorBox: {
    backgroundColor: S.errorBackground,
    borderColor: S.errorBorder,
    borderWidth: 1,
    borderRadius: SIZES.inputRadius,
    padding: 12,
  },
  errorText: { color: S.errorText, fontSize: 15, lineHeight: 24 },
  doneNote: { color: C.softText, fontSize: 15, textAlign: 'center' },
});
