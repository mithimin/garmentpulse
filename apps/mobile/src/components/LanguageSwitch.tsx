// apps/mobile/src/components/LanguageSwitch.tsx
//
// The small pill button in the top-right corner that flips the app between
// English and Bangla. It shows `EN · বাং` with the chosen language in bold.
// It is 36 px tall with extra invisible tap space, so the tappable area is
// at least 44 px (design system section 6).
// Owned by Rubaiya.

import { Pressable, StyleSheet, Text } from 'react-native';
import { useLanguage } from '../language/LanguageContext';

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();
  const next = language === 'en' ? 'bn' : 'en';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={language === 'en' ? 'Change language to Bangla' : 'ভাষা ইংরেজি করুন'}
      hitSlop={4}
      onPress={() => setLanguage(next)}
      style={styles.pill}
    >
      <Text style={[styles.part, language === 'en' && styles.chosen]}>EN</Text>
      <Text style={styles.part}> · </Text>
      <Text style={[styles.part, language === 'bn' && styles.chosen]}>বাং</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 36,
    minWidth: 44,
    paddingHorizontal: 12,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  part: { color: '#D3D9E8', fontSize: 13 },
  chosen: { color: '#FFFFFF', fontWeight: '700' },
});
