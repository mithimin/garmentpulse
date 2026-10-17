// apps/mobile/src/components/StatusLabel.tsx
//
// The small coloured "woven label" that shows a report's status. A colour is
// NEVER shown alone: it always comes with the word (from the shared word list)
// and, on phones, a small icon before the word (design system sections 4.4, 9.3).
//   Waiting = yellow + clock, In progress = blue + wrench, Resolved = green + tick.
// Owned by Rubaiya.

import { StyleSheet, Text, View } from 'react-native';
import { Check, Clock, Wrench } from 'lucide-react-native';
import { STATUS_LABELS } from '@garmentpulse/shared';
import type { ReportStatus } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';
import { STATUS_COLORS } from '../theme';

const ICONS = { waiting: Clock, in_progress: Wrench, resolved: Check } as const;

export function StatusLabel({ status }: { status: ReportStatus }) {
  const { language } = useLanguage();
  const colors = STATUS_COLORS[status];
  const Icon = ICONS[status];
  return (
    <View style={[styles.pill, { backgroundColor: colors.background }]}>
      <Icon color={colors.text} size={14} strokeWidth={1.8} />
      <Text style={[styles.text, { color: colors.text }]} numberOfLines={1}>
        {STATUS_LABELS[status][language]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  text: { fontSize: 13, fontWeight: '700' },
});
