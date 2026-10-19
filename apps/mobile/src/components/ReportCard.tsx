// apps/mobile/src/components/ReportCard.tsx
//
// One report shown as a card: the machine name, the status label, the first
// lines of the description, and when it was reported. If `onPress` is given the
// whole card can be tapped (to open the report's details).
// Owned by Rubaiya.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Report } from '@garmentpulse/shared';
import { Card } from './Card';
import { StatusLabel } from './StatusLabel';
import { useLanguage } from '../language/LanguageContext';
import { formatDateTime } from '../language/format';
import { COLORS as C } from '../theme';
import { machineName } from '../language/localNames';

type Props = {
  report: Report;
  onPress?: () => void;
};

export function ReportCard({ report, onPress }: Props) {
  const { language } = useLanguage();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
    >
      <Card>
        <View style={styles.top}>
          <Text style={styles.machine} numberOfLines={1}>
            {machineName(report.machine, language)}
          </Text>
          <StatusLabel status={report.status} />
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {report.description}
        </Text>
        <Text style={styles.time}>{formatDateTime(report.created_at, language)}</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: { gap: 8, marginBottom: 8 },
  machine: { color: C.text, fontSize: 18, fontWeight: '600' },
  description: { color: C.text, fontSize: 15, lineHeight: 24 },
  time: { color: C.softText, fontSize: 13, marginTop: 8 },
});
