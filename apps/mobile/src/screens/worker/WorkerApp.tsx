// apps/mobile/src/screens/worker/WorkerApp.tsx
//
// Everything a logged-in WORKER sees. It holds the blue top bar, the bottom bar
// with 3 tabs (Home, Report, My reports) and shows the screen of the chosen tab.
// Opening a report shows its details on top, with a back arrow in the top bar.
// The Report and My reports tabs also have a back arrow that returns to Home.
// The Android phone's back button does the same (see useBackAction).
//
// There is no navigation library on purpose: with only a few screens, a simple
// "which tab / which report is open" memory is easier to understand.
// Owned by Rubaiya.

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { House, List, Wrench } from 'lucide-react-native';
import type { Profile } from '@garmentpulse/shared';
import { BottomTabBar } from '../../components/BottomTabBar';
import type { TabItem } from '../../components/BottomTabBar';
import { TopBar } from '../../components/TopBar';
import { useBackAction } from '../../components/useBackAction';
import { useReports } from '../../data/ReportsContext';
import { useLanguage } from '../../language/LanguageContext';
import { WORKER_TEXT } from '../../language/screenText';
import { COLORS as C } from '../../theme';
import { MyReportsScreen } from './MyReportsScreen';
import { ReportDetailScreen } from './ReportDetailScreen';
import { ReportProblemScreen } from './ReportProblemScreen';
import { WorkerHomeScreen } from './WorkerHomeScreen';

type Tab = 'home' | 'report' | 'reports';

type Props = {
  profile: Profile;
  onLogout: () => void;
};

export function WorkerApp({ profile, onLogout }: Props) {
  const { language } = useLanguage();
  const { listMyReports } = useReports();
  const [tab, setTab] = useState<Tab>('home');
  const [openReportId, setOpenReportId] = useState<string | null>(null);

  const tabs: readonly TabItem<Tab>[] = [
    { key: 'home', label: WORKER_TEXT.tabHome[language], Icon: House },
    { key: 'report', label: WORKER_TEXT.tabReport[language], Icon: Wrench },
    { key: 'reports', label: WORKER_TEXT.tabMyReports[language], Icon: List },
  ];

  const openReport = listMyReports(profile).find((report) => report.id === openReportId);
  const titles: Record<Tab, string> = {
    home: WORKER_TEXT.tabHome[language],
    report: WORKER_TEXT.reportTitle[language],
    reports: WORKER_TEXT.myReportsTitle[language],
  };

  function changeTab(next: Tab) {
    setOpenReportId(null);
    setTab(next);
  }

  // Where "back" goes: from a report to the list, from another tab to Home.
  // On Home there is nowhere to go back to.
  const goBack = openReport
    ? () => setOpenReportId(null)
    : tab !== 'home'
      ? () => changeTab('home')
      : undefined;
  useBackAction(goBack);

  return (
    <View style={styles.page}>
      <TopBar
        title={openReport ? WORKER_TEXT.detailTitle[language] : titles[tab]}
        onBack={goBack}
      />

      <View style={styles.body}>
        {openReport ? (
          <ReportDetailScreen report={openReport} />
        ) : tab === 'home' ? (
          <WorkerHomeScreen
            profile={profile}
            onReportProblem={() => changeTab('report')}
            onOpenReport={setOpenReportId}
            onLogout={onLogout}
          />
        ) : tab === 'report' ? (
          <ReportProblemScreen profile={profile} onSeeMyReports={() => changeTab('reports')} />
        ) : (
          <MyReportsScreen profile={profile} onOpenReport={setOpenReportId} />
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
