// apps/mobile/src/components/DownTimer.tsx
//
// A small live label for the technician, like "Down for 12 min": how long a machine
// has been waiting since the worker reported it. It counts by itself. The colour
// gets stronger the longer the machine waits, and the words are always there too:
//   under 15 minutes = calm cream, 15 to 29 minutes = orange, 30 minutes or more = red.
// It is only shown for jobs that are not finished yet.
// Owned by Rubaiya.

import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../language/LanguageContext';
import { formatDuration } from '../language/format';
import { TECH_TEXT } from '../language/screenText';
import { MAP_COLORS } from '../theme';
import { useNow } from './useNow';

const LEVELS = {
  calm: {
    background: MAP_COLORS.ok.background,
    border: MAP_COLORS.ok.border,
    text: MAP_COLORS.ok.text,
  },
  late: { background: '#F8DDB0', border: '#E0B56A', text: '#7A4A0A' },
  urgent: { background: '#C23B2E', border: '#8F2A20', text: '#FFFFFF' },
} as const;

export function DownTimer({ since }: { since: string }) {
  const { language } = useLanguage();
  const now = useNow();
  const waited = Math.max(0, now - Date.parse(since));
  if (Number.isNaN(waited)) return null;

  const minutes = waited / 60_000;
  const level = minutes >= 30 ? LEVELS.urgent : minutes >= 15 ? LEVELS.late : LEVELS.calm;

  return (
    <View
      style={[styles.chip, { backgroundColor: level.background, borderColor: level.border }]}
      accessibilityLiveRegion="none"
    >
      <Text style={[styles.text, { color: level.text }]}>
        {TECH_TEXT.downFor[language]} {formatDuration(waited, language)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  text: { fontSize: 13, fontWeight: '700' },
});
