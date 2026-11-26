// apps/mobile/src/screens/technician/TechnicianApp.tsx
//
// Everything a logged-in TECHNICIAN sees. It holds the blue top bar, the bottom
// bar with 2 tabs (Jobs, History) and shows the screen of the chosen tab.
// Opening a job shows its page on top, with a back arrow in the top bar.
// The History tab also has a back arrow that returns to Jobs. The Android phone's
// back button does the same (see useBackAction).
// A short beep plays when a new job is assigned (see useNewJobSound).
// Works the same way as WorkerApp (no navigation library on purpose).
// Owned by Rubaiya.

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { History, Wrench } from 'lucide-react-native';
import type { Profile } from '@garmentpulse/shared';
import { BottomTabBar } from '../../components/BottomTabBar';
import { FabricBackground } from '../../components/FabricBackground';
import { FirstTimeGuide } from '../../components/FirstTimeGuide';
import type { TabItem } from '../../components/BottomTabBar';
import { TopBar } from '../../components/TopBar';
import { useBackAction } from '../../components/useBackAction';
import { useReports } from '../../data/ReportsContext';
import { useNewJobSound } from '../../data/useNewJobSound';
import { EXPENSE_TEXT } from '../../language/expenseText';
import { useLanguage } from '../../language/LanguageContext';
import { TECH_TEXT } from '../../language/screenText';
import { COLORS as C } from '../../theme';
import { HistoryScreen } from './HistoryScreen';
import { JobDetailScreen } from './JobDetailScreen';
import { JobCostScreen } from './JobCostScreen';
import { JobsScreen } from './JobsScreen';

type Tab = 'jobs' | 'history';

type Props = {
  profile: Profile;
  onLogout: () => void;
};

export function TechnicianApp({ profile, onLogout }: Props) {
  const { language } = useLanguage();
  const { listMyJobs } = useReports();
  useNewJobSound(profile);
  const [tab, setTab] = useState<Tab>('jobs');
  const [openJobId, setOpenJobId] = useState<string | null>(null);
  // The job whose cost screen is open (it opens after "Mark as fixed").
  const [costJobId, setCostJobId] = useState<string | null>(null);

  const tabs: readonly TabItem<Tab>[] = [
    { key: 'jobs', label: TECH_TEXT.tabJobs[language], Icon: Wrench },
    { key: 'history', label: TECH_TEXT.tabHistory[language], Icon: History },
  ];

  const jobs = listMyJobs(profile, true);
  const openJob = jobs.find((job) => job.id === openJobId);
  const costJob = jobs.find((job) => job.id === costJobId);
  const titles: Record<Tab, string> = {
    jobs: TECH_TEXT.jobsTitle[language],
    history: TECH_TEXT.historyTitle[language],
  };

  function changeTab(next: Tab) {
    setOpenJobId(null);
    setCostJobId(null);
    setTab(next);
  }

  // Where "back" goes: from the cost screen to its job, from a job to the list,
  // from History to Jobs. On Jobs there is nowhere to go back to.
  const goBack = costJob
    ? () => setCostJobId(null)
    : openJob
      ? () => setOpenJobId(null)
      : tab !== 'jobs'
        ? () => changeTab('jobs')
        : undefined;
  useBackAction(goBack);

  const title = costJob
    ? EXPENSE_TEXT.costScreenTitle[language]
    : openJob
      ? TECH_TEXT.jobTitle[language]
      : titles[tab];

  return (
    <View style={styles.page}>
      <FabricBackground />
      <FirstTimeGuide role="technician" />
      <TopBar title={title} onBack={goBack} />

      <View style={styles.body}>
        {costJob ? (
          <JobCostScreen job={costJob} />
        ) : openJob ? (
          <JobDetailScreen profile={profile} job={openJob} onOpenCost={setCostJobId} />
        ) : tab === 'jobs' ? (
          <JobsScreen profile={profile} onOpenJob={setOpenJobId} onLogout={onLogout} />
        ) : (
          <HistoryScreen profile={profile} onOpenJob={setOpenJobId} />
        )}
      </View>

      <BottomTabBar tabs={tabs} active={tab} onChange={changeTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.page },
  body: { flex: 1 },
});
