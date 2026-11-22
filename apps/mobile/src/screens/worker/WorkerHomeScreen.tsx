// apps/mobile/src/screens/worker/WorkerHomeScreen.tsx
//
// The worker's Home tab. A worker only works at ONE machine, so Home shows only
// that machine (not the whole factory map):
//   1. a plain hello with the worker's name;
//   2. a big picture of the worker's own machine that shows what is happening to it
//      (cream OK, red down with a glow and a beep, yellow technician assigned
//      or being fixed, back to cream when repaired);
//   3. a "Report a problem" button that opens the small report card for that
//      machine (four picture chips for common problems, plus optional words);
//   4. the live repair tracker, only while the worker has an unfinished report;
//   5. when nothing is open, the worker's latest report, then a "Log out" button.
// The old whole-factory map (`MachineMap.tsx`) is not used here any more.
// Owned by Rubaiya.

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getErrorCode } from '@garmentpulse/shared';
import type { Machine, Profile } from '@garmentpulse/shared';
import { Button } from '../../components/Button';
import { ChooseMachine } from '../../components/ChooseMachine';
import { FadeIn } from '../../components/FadeIn';
import { RefreshableScroll } from '../../components/RefreshableScroll';
import { Greeting } from '../../components/Greeting';
import { MachineReportSheet } from '../../components/MachineReportSheet';
import { MyMachine } from '../../components/MyMachine';
import { RepairTracker } from '../../components/RepairTracker';
import { ReportCard } from '../../components/ReportCard';
import type { MyMachineLook } from '../../components/myMachineLooks';
import type { MapMachine, MapStatus } from '../../data/fakeMachineMap';
import { useMyMachine } from '../../data/useMyMachine';
import { useReports } from '../../data/ReportsContext';
import { useLanguage } from '../../language/LanguageContext';
import { localizeDigits } from '../../language/format';
import { ERROR_TEXT, MY_MACHINE_TEXT, WORKER_TEXT } from '../../language/screenText';
import { COLORS as C, SHARED_COLORS as S, SIZES } from '../../theme';
import { personName } from '../../language/localNames';

type Props = {
  profile: Profile;
  onOpenReport: (reportId: string) => void;
  onLogout: () => void;
};

/** What the report card should show: a machine that is not OK can not be reported again. */
const CARD_STATUS: Record<MyMachineLook, MapStatus> = {
  ok: 'ok',
  down: 'down',
  assigned: 'waiting',
  fixing: 'in_progress',
};

/** Turns the real machine into the shape the report card expects. */
function cardMachine(machine: Machine, look: MyMachineLook): MapMachine {
  const seat = machine.seat ?? '';
  return {
    id: machine.id,
    code: machine.code ?? machine.name,
    floor: machine.floor ?? 1,
    row: seat.charAt(0),
    place: Number.parseInt(seat.slice(1), 10) || 0,
    status: CARD_STATUS[look],
  };
}

export function WorkerHomeScreen({ profile, onOpenReport, onLogout }: Props) {
  const { language } = useLanguage();
  const { listMyReports, createReport } = useReports();
  const {
    machine,
    needsChoice,
    machines,
    chooseMachine,
    changeMachine,
    look,
    refresh: refreshMachine,
  } = useMyMachine(profile);
  const [cardOpen, setCardOpen] = useState(false);
  const [sendError, setSendError] = useState<ReturnType<typeof getErrorCode> | null>(null);

  const reports = listMyReports(profile);
  // the newest report that is not finished yet (newest first), if there is one
  const open = reports.find((report) => report.status !== 'resolved');
  const latest = reports[0];

  // One friendly sentence about what is happening to her machine.
  const technicianName = open?.technician ? personName(open.technician, language) : null;
  const sentence =
    look === 'ok'
      ? MY_MACHINE_TEXT.sentenceOk[language]
      : look === 'down'
        ? MY_MACHINE_TEXT.sentenceDown[language]
        : look === 'assigned'
          ? technicianName
            ? `${technicianName} ${MY_MACHINE_TEXT.sentenceAssigned[language]}`
            : MY_MACHINE_TEXT.sentenceAssignedNoName[language]
          : technicianName
            ? `${technicianName} ${MY_MACHINE_TEXT.sentenceFixing[language]}`
            : MY_MACHINE_TEXT.sentenceFixingNoName[language];

  // "5 days running well": the days since her last report. It is only shown while the
  // machine is OK, and not at all if she never reported (we would be guessing).
  let streak: string | null = null;
  if (look === 'ok' && latest) {
    const days = Math.max(0, Math.floor((Date.now() - Date.parse(latest.created_at)) / 86_400_000));
    streak =
      days === 0
        ? MY_MACHINE_TEXT.runningToday[language]
        : `${localizeDigits(String(days), language)} ${
            days === 1
              ? MY_MACHINE_TEXT.runningDay[language]
              : MY_MACHINE_TEXT.runningDays[language]
          }`;
  }

  async function handleSend(target: MapMachine, description: string) {
    setCardOpen(false);
    setSendError(null);
    try {
      await createReport(profile, target.id, description);
    } catch (error) {
      setSendError(getErrorCode(error));
    }
  }

  return (
    <RefreshableScroll onRefresh={refreshMachine}>
      <Greeting greeting={WORKER_TEXT.homeHello[language]} name={personName(profile, language)} />

      {machine ? (
        <>
          <FadeIn>
            <MyMachine machine={machine} look={look} sentence={sentence} streak={streak} />
          </FadeIn>
          <FadeIn delay={120}>
            <Button
              label={MY_MACHINE_TEXT.reportButton[language]}
              onPress={() => {
                setSendError(null);
                setCardOpen(true);
              }}
            />
          </FadeIn>
          {sendError && (
            <View style={styles.error} accessibilityRole="alert">
              <Text style={styles.errorText}>{ERROR_TEXT[sendError][language]}</Text>
            </View>
          )}
          <MachineReportSheet
            machine={cardOpen ? cardMachine(machine, look) : null}
            onClose={() => setCardOpen(false)}
            onSend={handleSend}
          />
        </>
      ) : needsChoice ? (
        <ChooseMachine machines={machines} onChoose={chooseMachine} />
      ) : (
        <Text style={styles.empty}>{MY_MACHINE_TEXT.noMachine[language]}</Text>
      )}

      {open && (
        <FadeIn delay={240}>
          <RepairTracker report={open} onPress={() => onOpenReport(open.id)} />
        </FadeIn>
      )}

      {!open && (
        <>
          <Text style={styles.sectionTitle}>{WORKER_TEXT.homeLatestTitle[language]}</Text>
          {latest ? (
            <FadeIn delay={240}>
              <ReportCard report={latest} onPress={() => onOpenReport(latest.id)} />
            </FadeIn>
          ) : (
            <Text style={styles.empty}>{WORKER_TEXT.homeNoReports[language]}</Text>
          )}
        </>
      )}

      <View style={styles.logout}>
        {machine && (
          <Button
            kind="second"
            label={MY_MACHINE_TEXT.changeButton[language]}
            onPress={changeMachine}
          />
        )}
        <Button kind="second" label={WORKER_TEXT.logoutButton[language]} onPress={onLogout} />
      </View>
    </RefreshableScroll>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: C.text, fontSize: 18, fontWeight: '600' },
  empty: { color: C.softText, fontSize: 15 },
  error: {
    backgroundColor: S.errorBackground,
    borderColor: S.errorBorder,
    borderWidth: 1,
    borderRadius: SIZES.inputRadius,
    padding: 12,
  },
  errorText: { color: S.errorText, fontSize: 14 },
  logout: { marginTop: 8, gap: 10 },
});
