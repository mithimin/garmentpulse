// apps/mobile/src/screens/technician/TechnicianApp.tsx
//
// Everything a logged-in TECHNICIAN sees. It holds the blue top bar, the bottom
// bar with 2 tabs (Jobs, History) and shows the screen of the chosen tab.
// Opening a job shows its page on top, with a back arrow in the top bar.
// The History tab also has a back arrow that returns to Jobs. The Android phone's
// back button does the same (see useBackAction).
// Works the same way as WorkerApp (no navigation library on purpose).
// Owned by Rubaiya.

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { History, Wrench } from 'lucide-react-native';
import type { Profile } from '@garmentpulse/shared';
import { BottomTabBar } from '../../components/BottomTabBar';
import type { TabItem } from '../../components/BottomTabBar';
import { TopBar } from '../../components/TopBar';
import { useBackAction } from '../../components/useBackAction';
import { useReports } from '../../data/ReportsContext';
import { useLanguage } from '../../language/LanguageContext';
import { TECH_TEXT } from '../../language/screenText';
import { COLORS as C } from '../../theme';
import { HistoryScreen } from './HistoryScreen';
import { JobDetailScreen } from './JobDetailScreen';
import { JobsScreen } from './JobsScreen';

type Tab = 'jobs' | 'history';

type Props = {
  profile: Profile;
  onLogout: () => void;
};

export function TechnicianApp({ profile, onLogout }: Props) {
  const { language } = useLanguage();
  const { listMyJobs } = useReports();
  const [tab, setTab] = useState<Tab>('jobs');
  const [openJobId, setOpenJobId] = useState<string | null>(null);

  const tabs: readonly TabItem<Tab>[] = [
    { key: 'jobs', label: TECH_TEXT.tabJobs[language], Icon: Wrench },
    { key: 'history', label: TECH_TEXT.tabHistory[language], Icon: History },
  ];

  const openJob = listMyJobs(profile, true).find((job) => job.id === openJobId);
  const titles: Record<Tab, string> = {
    jobs: TECH_TEXT.jobsTitle[language],
    history: TECH_TEXT.historyTitle[language],
  };

  function changeTab(next: Tab) {
    setOpenJobId(null);
    setTab(next);
  }

  // Where "back" goes: from a job to the list, from History to Jobs.
  // On Jobs there is nowhere to go back to.
  const goBack = openJob
    ? () => setOpenJobId(null)
    : tab !== 'jobs'
      ? () => changeTab('jobs')
      : undefined;
  useBackAction(goBack);

  return (
    <View style={styles.page}>
      <TopBar title={openJob ? TECH_TEXT.jobTitle[language] : titles[tab]} onBack={goBack} />

      <View style={styles.body}>
        {openJob ? (
          <JobDetailScreen profile={profile} job={openJob} />
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
