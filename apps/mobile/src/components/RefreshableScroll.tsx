// apps/mobile/src/components/RefreshableScroll.tsx
//
// A scrolling screen that can be PULLED DOWN to update (like most phone apps). When
// the person pulls, it downloads the reports and jobs again (and anything extra the
// screen asks for with `onRefresh`). If the last download failed (for example, no
// internet), a small message at the top says so and tells them to pull down again.
// The four list screens (worker Home and My reports, technician Jobs and History)
// all use this, so they behave the same.
// Owned by Rubaiya.

import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useReports } from '../data/ReportsContext';
import { useLanguage } from '../language/LanguageContext';
import { COMMON_TEXT } from '../language/screenText';
import { COLORS as C, SHARED_COLORS as S, SIZES } from '../theme';

type Props = {
  children: ReactNode;
  /** Extra things to download when the person pulls down (optional). */
  onRefresh?: () => Promise<void>;
};

export function RefreshableScroll({ children, onRefresh }: Props) {
  const { language } = useLanguage();
  const { refresh, loadFailed } = useReports();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refresh(), onRefresh?.()]);
    } finally {
      setRefreshing(false);
    }
  }, [refresh, onRefresh]);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void handleRefresh()}
          tintColor={C.mainButton}
          colors={[C.mainButton]}
        />
      }
    >
      {loadFailed && (
        <View style={styles.error} accessibilityRole="alert">
          <Text style={styles.errorText}>{COMMON_TEXT.noInternet[language]}</Text>
        </View>
      )}
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: SIZES.screenPadding, gap: 18 },
  error: {
    backgroundColor: S.errorBackground,
    borderColor: S.errorBorder,
    borderWidth: 1,
    borderRadius: SIZES.inputRadius,
    padding: 12,
  },
  errorText: { color: S.errorText, fontSize: 14, lineHeight: 22 },
});
