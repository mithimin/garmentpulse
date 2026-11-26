// apps/mobile/src/screens/technician/JobDetailScreen.tsx
//
// The page of ONE job, where the technician does the work in three small steps:
//   1. "Accept job"     -> the technician takes the job (status stays Waiting)
//   2. "Start work"     -> Waiting becomes In progress
//   3. "Mark as fixed"  -> In progress becomes Resolved (final)
// Only the button for the NEXT step is shown, because a status only moves
// forward (docs/api-contract.md 2.6). The page also shows the machine and WHERE it
// stands (floor, row, seat) in big letters, what the worker wrote, who reported it,
// when, and a 4-step list (Assigned, Accepted, Fixing, Done) that also shows how
// long the repair took once the job is finished.
// If the (fake) backend refuses, a friendly sentence is shown under the buttons.
// Owned by Rubaiya.

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Check, Play, Wrench } from 'lucide-react-native';
import { getErrorCode } from '@garmentpulse/shared';
import type { Profile, Report } from '@garmentpulse/shared';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { DownTimer } from '../../components/DownTimer';
import { FloorMiniMap } from '../../components/FloorMiniMap';
import { StatusLabel } from '../../components/StatusLabel';
import { VerticalSteps } from '../../components/VerticalSteps';
import type { VerticalStep } from '../../components/VerticalSteps';
import { useReports } from '../../data/ReportsContext';
import { useLanguage } from '../../language/LanguageContext';
import { formatDateTime } from '../../language/format';
import { machinePlace } from '../../language/machinePlace';
import { repairTime } from '../../language/repairTime';
import { EXPENSE_TEXT } from '../../language/expenseText';
import { ERROR_TEXT, TECH_TEXT, TRACK_TEXT } from '../../language/screenText';
import { COLORS as C, SHARED_COLORS as S, SIZES } from '../../theme';
import { machineName, personName } from '../../language/localNames';

type Props = {
  profile: Profile;
  job: Report;
  /** Opens the cost screen for this job (used right after "Mark as fixed", and later from this page). */
  onOpenCost: (reportId: string) => void;
};

export function JobDetailScreen({ profile, job, onOpenCost }: Props) {
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
      // After "Mark as fixed" works, the technician goes straight to the cost screen.
      onPress: () =>
        run(async () => {
          await updateJobStatus(profile, job.id, 'resolved');
          onOpenCost(job.id);
        }),
    };
  }

  // The four steps of the job, from the technician's side.
  const accepted = job.accepted_at !== null;
  const resolved = job.status === 'resolved';
  const took = repairTime(job, language);
  const steps: VerticalStep[] = [
    { title: TECH_TEXT.stepAssigned[language], state: 'done' },
    {
      title: TECH_TEXT.acceptedAtLabel[language],
      detail: job.accepted_at
        ? formatDateTime(job.accepted_at, language)
        : TECH_TEXT.notAcceptedYet[language],
      state: accepted ? 'done' : 'current',
    },
    {
      title: TRACK_TEXT.fixing[language],
      detail: resolved
        ? took
          ? `${TECH_TEXT.repairTook[language]} ${took}`
          : ''
        : job.status === 'in_progress'
          ? TECH_TEXT.youWorking[language]
          : TRACK_TEXT.notStarted[language],
      state: resolved ? 'done' : accepted ? 'current' : 'todo',
    },
    {
      title: TRACK_TEXT.done[language],
      detail: resolved ? formatDateTime(job.updated_at, language) : '',
      state: resolved ? 'done' : 'todo',
    },
  ];
  const place = machinePlace(job.machine, language);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.machine}>
          {machineName(job.machine, language)}
          {job.machine.code ? `  ·  ${job.machine.code}` : ''}
        </Text>
        {place ? (
          <>
            <Text style={styles.whereLabel}>{TECH_TEXT.whereLabel[language]}</Text>
            <Text style={styles.place}>{place}</Text>
          </>
        ) : null}
        <FloorMiniMap floor={job.machine.floor} seat={job.machine.seat} />
        <View style={styles.statusRow}>
          <StatusLabel status={job.status} />
          {!resolved && <DownTimer since={job.created_at} />}
        </View>

        <Text style={styles.label}>{TECH_TEXT.problemLabel[language]}</Text>
        <Text style={styles.problem}>{job.description}</Text>

        <Text style={styles.label}>{TECH_TEXT.reportedByLabel[language]}</Text>
        <Text style={styles.value}>{personName(job.reported_by, language)}</Text>

        <Text style={styles.label}>{TECH_TEXT.reportedAtLabel[language]}</Text>
        <Text style={styles.value}>{formatDateTime(job.created_at, language)}</Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>{TECH_TEXT.progressLabel[language]}</Text>
        <View style={styles.tracker}>
          <VerticalSteps steps={steps} />
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
        <>
          <Text style={styles.doneNote}>{TECH_TEXT.doneNote[language]}</Text>
          <Button
            kind="second"
            label={EXPENSE_TEXT.addCostButton[language]}
            onPress={() => onOpenCost(job.id)}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: SIZES.screenPadding, gap: 18 },
  machine: { color: C.text, fontSize: 20, fontWeight: '600', marginBottom: 8 },
  whereLabel: { color: C.softText, fontSize: 13, fontWeight: '600' },
  place: { color: C.mainButton, fontSize: 22, fontWeight: '700', marginTop: 2 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 12,
  },
  problem: { color: C.text, fontSize: 18, lineHeight: 26, fontWeight: '600', marginTop: 2 },
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
